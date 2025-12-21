"use client"

import { use, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProdutoImagem, Produto } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ImagemComProduto extends ProdutoImagem {
  produto?: Produto
}

export default function VerImagemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [imagem, setImagem] = useState<ImagemComProduto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadImagem()
    }
  }, [id])

  const loadImagem = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase
      .from("produto_imagens")
      .select(`
        *,
        produto:produtos(id, nome)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao carregar imagem:", error)
      router.push("/app/imagens")
    } else {
      setImagem(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Carregando..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!imagem) {
    return (
      <>
        <AppHeader title="Imagem não encontrada" />
        <div className="p-6">
          <p>Imagem não encontrada.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Detalhes da Imagem">
        <Link href={`/app/imagens/${id}/editar`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>

        <Link href="/app/imagens">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <Image
                src={imagem.url || "/placeholder.svg"}
                alt="Imagem do produto"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produto</p>
                <p className="text-lg">{imagem.produto?.nome || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">URL</p>
                <p className="text-sm font-mono break-all">{imagem.url}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Ordem</p>
                <p className="text-lg">{imagem.ordem}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                <p className="text-lg">
                  {new Date(imagem.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
