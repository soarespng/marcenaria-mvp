"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Loader2, ArrowUp, ArrowDown } from "lucide-react"
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

        if (produtoId) {
          const ordem = safeImages.length + uploadedUrls.length - 1
          await supabase.from("produto_imagens").insert({
            produto_id: produtoId,
            url: publicUrl,
            ordem: ordem,
          })
        }
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
      if (produtoId) {
        const supabase = createClient()
        await supabase.from("produto_imagens").delete().eq("produto_id", produtoId).eq("url", url)
      }

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

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newImages = [...safeImages]
    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    onChange(newImages)

    updateImageOrder(newImages)
  }

  const moveImageDown = (index: number) => {
    if (index === safeImages.length - 1) return
    const newImages = [...safeImages]
    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    onChange(newImages)

    updateImageOrder(newImages)
  }

  const updateImageOrder = async (orderedImages: string[]) => {
    if (!produtoId) return

    const supabase = createClient()
    for (let i = 0; i < orderedImages.length; i++) {
      await supabase
        .from("produto_imagens")
        .update({ ordem: i })
        .eq("produto_id", produtoId)
        .eq("url", orderedImages[i])
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          Imagens do Produto ({safeImages.length}/{maxImages})
        </Label>
        <div className="flex items-center gap-2">
          <Button type="button" className="hover:bg-transparent cursor-pointer" variant="outline" disabled={uploading || safeImages.length >= maxImages} asChild>
            <label className="cursor-pointer ">
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

              <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveImageUp(index)}
                  disabled={index === 0}
                  title="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveImageDown(index)}
                  disabled={index === safeImages.length - 1}
                  title="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

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
