"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Produto } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default function VerProdutoPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)

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

    const { data, error } = await supabase.from("produtos").select("*").eq("id", id).single()

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
      <AppHeader title="Detalhes do Produto">
        <Link href={`/app/produtos/${id}/editar`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
        <Link href="/app/produtos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-2xl">
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
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de criação</h3>
              <p className="text-base">{formatDate(produto.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
