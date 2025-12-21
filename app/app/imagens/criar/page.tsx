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

export default function CriarImagemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [formData, setFormData] = useState({
    produto_id: "",
    url: "",
    ordem: 1,
  })

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    const supabase = createClient()
    setLoadingProdutos(true)

    const { data, error } = await supabase.from("produtos").select("*").order("nome")

    if (error) {
      console.error("Erro ao carregar produtos:", error)
    } else {
      setProdutos(data || [])
    }

    setLoadingProdutos(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("produto_imagens").insert([
        {
          produto_id: formData.produto_id,
          url: formData.url,
          ordem: formData.ordem,
        },
      ])

      if (error) throw error

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/app/imagens")
    } catch (error) {
      console.error("Erro ao criar imagem:", error)
      alert("Erro ao criar imagem. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader title="Nova Imagem" />

      <div className="p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="produto_id">Produto *</Label>
                {loadingProdutos ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando produtos...
                  </div>
                ) : (
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
                )}
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
                  {loading ? "Salvando..." : "Criar Imagem"}
                </Button>
                <Button type="button" className="hover:bg-transparent cursor-pointer" variant="outline" onClick={() => router.back()} disabled={loading}>
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
