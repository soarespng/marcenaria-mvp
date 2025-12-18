"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { MaskedInput } from "@/components/masked-input"
import { isValidEmail, isValidPhone } from "@/lib/validators"

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export default function EditarContatoPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    numero: "",
    observacao: "",
  })

  useEffect(() => {
    if (id === "criar") {
      router.push("/app/contatos/criar")
      return
    }

    if (!isValidUUID(id)) {
      setLoading(false)
      return
    }

    loadContato()
  }, [id])

  const loadContato = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase.from("contatos_simples").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao carregar contato:", error)
    } else if (data) {
      setFormData({
        nome: data.nome,
        email: data.email,
        numero: data.numero || "",
        observacao: data.observacao || "",
      })
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(formData.email)) {
      alert("Email inválido")
      return
    }

    if (formData.numero && !isValidPhone(formData.numero)) {
      alert("Número de telefone inválido")
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("contatos_simples")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      router.push(`/app/contatos/${id}`)
    } catch (error) {
      console.error("Erro ao atualizar contato:", error)
      alert("Erro ao atualizar contato. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Editar Contato" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Editar Contato">
        <Link href={`/app/contatos/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <MaskedInput
                  id="numero"
                  mask="phone"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  rows={4}
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Link href={`/app/contatos/${id}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
