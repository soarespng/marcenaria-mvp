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
import { Loader2 } from "lucide-react"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { refresh: refreshConfig } = useConfig()
  const [config, setConfig] = useState<Configuracoes | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        alert("Nenhuma configuração encontrada. Entre em contato com o administrador.")
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
      alert("Erro ao carregar configurações: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome_empresa.trim()) {
      alert("Nome da empresa é obrigatório")
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

      alert("Configurações salvas com sucesso!")
      await loadConfig()
      refreshConfig()
    } catch (error: any) {
      console.error("Erro ao salvar:", error.message)
      alert("Erro ao salvar configurações")
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <AppHeader title="Configurações">
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
                  <Label htmlFor="logo_url">URL da Logo</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img
                        src={formData.logo_url || "/placeholder.svg"}
                        alt="Preview da logo"
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
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
                  <Label htmlFor="email_contato">Email de contato</Label>
                  <Textarea
                    id="email_contato"
                    value={formData.email_contato}
                    onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                    placeholder="email@contato.com.br"
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

              {/* Preview das cores */}
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
