"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Produto } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EditarImagemPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [formData, setFormData] = useState({
    produto_id: "",
    url: "",
    ordem: 1,
  })

  useEffect(() => {
    if (id) {
      Promise.all([loadImagem(), loadProdutos()])
    }
  }, [id])

  const loadImagem = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.from("produto_imagens").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao carregar imagem:", error)
      router.push("/app/imagens")
    } else if (data) {
      setFormData({
        produto_id: data.produto_id,
        url: data.url,
        ordem: data.ordem,
      })
    }

    setLoadingData(false)
  }

  const loadProdutos = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.from("produtos").select("*").order("nome")

    if (error) {
      console.error("Erro ao carregar produtos:", error)
    } else {
      setProdutos(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("produto_imagens")
        .update({
          produto_id: formData.produto_id,
          url: formData.url,
          ordem: formData.ordem,
        })
        .eq("id", id)

      if (error) throw error

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push(`/app/imagens/${id}`)
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error)
      alert("Erro ao atualizar imagem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <>
        <AppHeader title="Carregando..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Editar Imagem" />

      <div className="p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="produto_id">Produto *</Label>
                <Select
                  value={formData.produto_id}
                  onValueChange={(value) => setFormData({ ...formData, produto_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL da Imagem *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ordem">Ordem</Label>
                <Input
                  id="ordem"
                  type="number"
                  min="1"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
