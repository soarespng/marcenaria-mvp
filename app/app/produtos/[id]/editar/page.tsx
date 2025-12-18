"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProdutoComImagens, Categoria } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"

export default function EditarProdutoPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const [produto, setProduto] = useState<ProdutoComImagens | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [estoque, setEstoque] = useState("")
  const [categoriaId, setCategoriaId] = useState<string>("")
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [imagens, setImagens] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (id === "criar") {
      router.push("/app/produtos/criar")
      return
    }
    loadProduto()
    loadCategorias()
  }, [id])

  const loadCategorias = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("categorias").select("*").order("nome")
    if (data) {
      setCategorias(data)
    }
  }

  const loadProduto = async () => {
    if (id === "criar") return

    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase
      .from("produtos")
      .select(
        `
        *,
        imagens:produto_imagens(*)
      `,
      )
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao carregar produto:", error)
      setError(error.message)
    } else {
      setProduto(data)
      setNome(data.nome)
      setDescricao(data.descricao || "")
      setPreco(data.preco.toString())
      setEstoque(data.estoque.toString())
      setCategoriaId(data.categoria_id || "")
      setImagens(data.imagens?.sort((a, b) => a.ordem - b.ordem).map((img) => img.url) || [])
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("produtos")
        .update({
          nome,
          descricao: descricao || null,
          preco: Number.parseFloat(preco),
          estoque: Number.parseInt(estoque),
          categoria_id: categoriaId || null,
        })
        .eq("id", id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      await supabase.from("produto_imagens").delete().eq("produto_id", id)

      if (imagens.length > 0) {
        const imagensData = imagens.map((url, index) => ({
          produto_id: id,
          url,
          ordem: index,
        }))

        const { error: imagensError } = await supabase.from("produto_imagens").insert(imagensData)

        if (imagensError) {
          console.error("Erro ao salvar imagens:", imagensError)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push(`/app/produtos/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Editar Produto" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!produto) {
    return (
      <>
        <AppHeader title="Produto não encontrado" />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">O produto solicitado não foi encontrado.</p>
              <div className="flex justify-center mt-4">
                <Link href="/app/produtos">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Editar Produto">
        <Link href={`/app/produtos/${id}`}>
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
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do produto"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição do produto"
                  rows={4}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="0.00"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estoque">Estoque *</Label>
                  <Input
                    id="estoque"
                    type="number"
                    min="0"
                    required
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
              </div>

              <ImageUpload produtoId={id} images={imagens} onChange={setImagens} maxImages={5} />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
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
                <Link href={`/app/produtos/${id}`}>
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
