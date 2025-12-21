"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
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
import type { Categoria } from "@/types"

export default function CriarProdutoPage() {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [estoque, setEstoque] = useState("")
  const [categoriaId, setCategoriaId] = useState<string>("")
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [produtoId, setProdutoId] = useState<string | null>(null)
  const [etapa, setEtapa] = useState<"dados" | "imagens">("dados")
  const [images, setImages] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("categorias").select("*").order("nome")
    if (data) {
      setCategorias(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: produto, error: insertError } = await supabase
        .from("produtos")
        .insert({
          nome,
          descricao: descricao || null,
          preco: Number.parseFloat(preco),
          estoque: Number.parseInt(estoque),
          categoria_id: categoriaId || null,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      if (produto) {
        setProdutoId(produto.id)
        setEtapa("imagens")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto")
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizarCriacao = () => {
    router.push("/app/produtos")
  }

  if (etapa === "imagens" && produtoId) {
    return (
      <>
        <AppHeader title="Adicionar Imagens">
          <Button variant="outline" className="hover:bg-transparent cursor-pointer" onClick={handleFinalizarCriacao}>
            Finalizar e Voltar
          </Button>
        </AppHeader>

        <div className="p-6 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <Alert>
                  <AlertDescription>
                    Produto criado com sucesso! Agora você pode adicionar imagens ao produto.
                  </AlertDescription>
                </Alert>
              </div>

              <ImageUpload produtoId={produtoId} images={images} onChange={setImages} />

              <div className="mt-6 flex justify-center">
                <Button onClick={handleFinalizarCriacao}>Finalizar e Voltar para Produtos</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Criar Produto">
        <Link href="/app/produtos">
          <Button variant="outline" className="hover:bg-transparent cursor-pointer">
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId} disabled={loading}>
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
                  disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Produto e Adicionar Imagens"
                  )}
                </Button>
                <Link href="/app/produtos">
                  <Button type="button" className="hover:bg-transparent cursor-pointer" variant="outline" disabled={loading}>
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
