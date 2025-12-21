"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CriarCategoriaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast({
        variant: "destructive",
        title: "Validação",
        description: "Nome é obrigatório",
      })
      return
    }

    setSaving(true)

    try {
      const slug = formData.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const { error } = await supabase.from("categorias").insert([
        {
          nome: formData.nome,
          slug,
          descricao: formData.descricao || null,
        },
      ])

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      })

      router.push("/app/categorias")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar categoria",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppHeader title="Nova Categoria">
        <Button variant="outline" onClick={() => router.push("/app/categorias")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </AppHeader>

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Nova Categoria</CardTitle>
            <CardDescription>Preencha os dados da nova categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Mesas, Cadeiras, Estantes..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição opcional da categoria"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/app/categorias")}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Categoria"
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
