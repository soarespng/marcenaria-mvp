"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploadProps {
  produtoId?: string
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ produtoId, images, onChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const safeImages = images || []

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (safeImages.length + files.length > maxImages) {
      setError(`Você pode adicionar no máximo ${maxImages} imagens`)
      return
    }

    setUploading(true)
    setError(null)
    const supabase = createClient()

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} não é uma imagem válida`)
          continue
        }

        // Criar nome único para o arquivo
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const fileExt = file.name.split(".").pop()
        const fileName = `${timestamp}-${randomString}.${fileExt}`

        const { data, error: uploadError } = await supabase.storage.from("produtos").upload(fileName, file)

        if (uploadError) {
          console.error("Erro ao fazer upload:", uploadError)
          setError(`Erro ao fazer upload: ${uploadError.message || "Verifique as permissões do bucket"}`)
          continue
        }

        // Obter URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("produtos").getPublicUrl(data.path)

        uploadedUrls.push(publicUrl)
      }

      onChange([...safeImages, ...uploadedUrls])
    } catch (err) {
      console.error("Erro no upload:", err)
      setError("Erro ao fazer upload das imagens")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = async (url: string, index: number) => {
    try {
      // Extrair o nome do arquivo da URL
      const fileName = url.split("/").pop()
      if (fileName) {
        const supabase = createClient()
        await supabase.storage.from("produtos").remove([fileName])
      }
    } catch (err) {
      console.error("Erro ao remover imagem:", err)
    }

    const newImages = safeImages.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          Imagens do Produto ({safeImages.length}/{maxImages})
        </Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" disabled={uploading || safeImages.length >= maxImages} asChild>
            <label className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Imagens
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || safeImages.length >= maxImages}
              />
            </label>
          </Button>
          <span className="text-sm text-muted-foreground">Formatos: JPG, PNG, WebP (máx. {maxImages})</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {safeImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {safeImages.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <Image src={url || "/placeholder.svg"} alt={`Imagem ${index + 1}`} fill className="object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(url, index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                Imagem {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
