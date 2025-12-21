"use client"

import { use, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProdutoComImagens } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default function VerProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [produto, setProduto] = useState<ProdutoComImagens | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (id === "criar") {
      router.push("/app/produtos/criar")
      return
    }

    if (!isValidUUID(id)) {
      setLoading(false)
      return
    }

    loadProduto()
  }, [id, router])

  const loadProduto = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase
      .from("produtos")
      .select(`
        *,
        imagens:produto_imagens(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao carregar produto:", error)
    } else {
      setProduto(data)
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const nextImage = () => {
    if (produto?.imagens && produto.imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % produto.imagens.length)
    }
  }

  const prevImage = () => {
    if (produto?.imagens && produto.imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + produto.imagens.length) % produto.imagens.length)
    }
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Detalhes do Produto" />
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
                  <Button variant="outline" className="hover:bg-transparent cursor-pointer">
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

  const imagensOrdenadas = produto.imagens?.sort((a, b) => a.ordem - b.ordem) || []
  const imagemAtual = imagensOrdenadas[currentImageIndex]

  return (
    <>
      <AppHeader title="Detalhes do Produto">
        <Link href={`/app/produtos/${id}/editar`}>
          <Button className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
        <Link href="/app/produtos">
          <Button variant="outline" className="hover:bg-transparent cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              {imagensOrdenadas.length > 0 ? (
                <div className="space-y-4">
                  {/* Imagem principal */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <Image
                      src={imagemAtual?.url || "/placeholder.svg"}
                      alt={produto.nome}
                      fill
                      className="object-cover"
                    />

                    {/* Navegação - só aparece se tiver mais de 1 imagem */}
                    {imagensOrdenadas.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                          aria-label="Imagem anterior"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>

                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                          aria-label="Próxima imagem"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Contador */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {imagensOrdenadas.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {imagensOrdenadas.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {imagensOrdenadas.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <Image
                            src={img.url || "/placeholder.svg"}
                            alt={`Imagem ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Sem imagens</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do produto */}
          <Card>
            <CardHeader>
              <CardTitle>{produto.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
                <p className="text-base">{produto.descricao || "Sem descrição"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Preço</h3>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(produto.preco)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Estoque</h3>
                  <p className="text-2xl font-bold">{produto.estoque} unidades</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total de imagens</h3>
                <p className="text-base">
                  {imagensOrdenadas.length} {imagensOrdenadas.length === 1 ? "imagem" : "imagens"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de criação</h3>
                <p className="text-base">{formatDate(produto.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
