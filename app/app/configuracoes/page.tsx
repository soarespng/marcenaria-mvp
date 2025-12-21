"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Configuracoes } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { applyPhoneMask } from "@/lib/validators"
import { AppHeader } from "@/components/app-header"
import { useConfig } from "@/hooks/use-config"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, LinkIcon } from "lucide-react"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { refresh: refreshConfig } = useConfig()
  const { toast } = useToast()
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url")
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nome_empresa: "",
    telefone: "",
    endereco: "",
    email_contato: "",
    horario_funcionamento: "",
    logo_url: "",
    cor_primaria: "#0ea5e9",
    cor_secundaria: "#1e293b",
    cor_destaque: "#f59e0b",
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("configuracoes").select("*")

      if (error) throw error

      const configData = Array.isArray(data) ? data[0] : data

      if (!configData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nenhuma configuração encontrada. Entre em contato com o administrador.",
        })
        return
      }

      setConfig(configData)
      setFormData({
        nome_empresa: configData.nome_empresa || "",
        telefone: configData.telefone || "",
        endereco: configData.endereco || "",
        email_contato: configData.email_contato || "",
        horario_funcionamento: configData.horario_funcionamento || "",
        logo_url: configData.logo_url || "",
        cor_primaria: configData.cor_primaria || "#0ea5e9",
        cor_secundaria: configData.cor_secundaria || "#1e293b",
        cor_destaque: configData.cor_destaque || "#f59e0b",
      })
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error.message)
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem",
      })
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
      })
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("public").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("public").getPublicUrl(filePath)

      setFormData({ ...formData, logo_url: publicUrl })

      toast({
        title: "Sucesso",
        description: "Logo enviada com sucesso!",
      })
    } catch (error: any) {
      console.error("Erro no upload:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao enviar arquivo",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo_url: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome_empresa.trim()) {
      toast({
        variant: "destructive",
        title: "Validação",
        description: "Nome da empresa é obrigatório",
      })
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("configuracoes")
        .update({
          nome_empresa: formData.nome_empresa,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          email_contato: formData.email_contato || null,
          horario_funcionamento: formData.horario_funcionamento || null,
          logo_url: formData.logo_url || null,
          cor_primaria: formData.cor_primaria,
          cor_secundaria: formData.cor_secundaria,
          cor_destaque: formData.cor_destaque,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config?.id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      })
      await loadConfig()
      refreshConfig()
    } catch (error: any) {
      console.error("Erro ao salvar:", error.message)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar configurações",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = applyPhoneMask(e.target.value)
    setFormData({ ...formData, telefone: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl">⏳</div>
          <p className="mt-2">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppHeader title="Configurações">
        <Button variant="outline" onClick={() => router.push("/app/produtos")}>
          ← Voltar
        </Button>
      </AppHeader>

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>Atualize os dados da empresa que serão exibidos publicamente</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome_empresa">
                    Nome da Empresa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome_empresa"
                    value={formData.nome_empresa}
                    onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                    required
                    placeholder="Ex: Marcenaria Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo da Empresa</Label>

                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant={uploadMode === "url" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUploadMode("url")}
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMode === "file" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUploadMode("file")}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Arquivo
                    </Button>
                  </div>

                  {uploadMode === "url" && (
                    <Input
                      id="logo_url"
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  )}

                  {uploadMode === "file" && (
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo_file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="flex-1"
                      />
                      {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
                    </div>
                  )}

                  {formData.logo_url && (
                    <div className="mt-3 p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Preview:</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <img
                        src={formData.logo_url || "/placeholder.svg"}
                        alt="Preview da logo"
                        className="h-20 object-contain bg-white p-2 rounded"
                      />
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 5MB</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone de Contato</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade, estado"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">E-mail para contato</Label>
                  <Textarea
                    id="email_contato"
                    value={formData.email_contato}
                    onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                    placeholder="Email@contato.com.br"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horario_funcionamento">Horário de Funcionamento</Label>
                  <Textarea
                    id="horario_funcionamento"
                    value={formData.horario_funcionamento}
                    onChange={(e) => setFormData({ ...formData, horario_funcionamento: e.target.value })}
                    placeholder="Ex: Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h"
                    rows={2}
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalização de Cores</CardTitle>
              <CardDescription>Customize as cores do seu site e dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cor_primaria">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor_primaria"
                      type="color"
                      value={formData.cor_primaria}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.cor_primaria}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      placeholder="#0ea5e9"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em botões e elementos principais</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor_secundaria"
                      type="color"
                      value={formData.cor_secundaria}
                      onChange={(e) => setFormData({ ...formData, cor_secundaria: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.cor_secundaria}
                      onChange={(e) => setFormData({ ...formData, cor_secundaria: e.target.value })}
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em backgrounds e textos</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor_destaque">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cor_destaque"
                      type="color"
                      value={formData.cor_destaque}
                      onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.cor_destaque}
                      onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em badges e alertas</p>
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <p className="text-sm font-medium mb-3">Preview:</p>
                <div className="flex gap-3">
                  <div
                    className="h-12 flex-1 rounded-md flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: formData.cor_primaria }}
                  >
                    Primária
                  </div>
                  <div
                    className="h-12 flex-1 rounded-md flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: formData.cor_secundaria }}
                  >
                    Secundária
                  </div>
                  <div
                    className="h-12 flex-1 rounded-md flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: formData.cor_destaque }}
                  >
                    Destaque
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
