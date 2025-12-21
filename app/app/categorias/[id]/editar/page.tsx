"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Categoria } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadCategoria()
  }, [id])

  const loadCategoria = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("categorias").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao carregar categoria:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar categoria",
      })
      router.push("/app/categorias")
    } else {
      setCategoria(data)
      setFormData({
        nome: data.nome,
        descricao: data.descricao || "",
      })
    }
    setLoading(false)
  }

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

      const { error } = await supabase
        .from("categorias")
        .update({
          nome: formData.nome,
          slug,
          descricao: formData.descricao || null,
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      })

      router.push("/app/categorias")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar categoria",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Editar Categoria" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!categoria) {
    return null
  }

  return (
    <>
      <AppHeader title="Editar Categoria">
        <Button variant="outline" onClick={() => router.push("/app/categorias")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </AppHeader>

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Editar Categoria</CardTitle>
            <CardDescription>Atualize as informações da categoria</CardDescription>
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
