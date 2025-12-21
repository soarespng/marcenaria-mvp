"use client"

import { use, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Contato } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"

export default function VerOrcamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [orcamento, setOrcamento] = useState<Contato | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrcamento()
  }, [id])

  const loadOrcamento = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase.from("contatos").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao carregar orçamento:", error)
    } else {
      setOrcamento(data)
    }

    setLoading(false)
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
        <AppHeader title="Detalhes do Orçamento" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!orcamento) {
    return (
      <>
        <AppHeader title="Orçamento não encontrado" />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">O orçamento solicitado não foi encontrado.</p>
              <div className="flex justify-center mt-4">
                <Link href="/app/orcamentos">
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
      <AppHeader title="Detalhes do Orçamento">
        <a href={`mailto:${orcamento.email}`}>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Responder
          </Button>
        </a>
        <Link href="/app/orcamentos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{orcamento.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
              <a href={`mailto:${orcamento.email}`} className="text-base text-primary hover:underline">
                {orcamento.email}
              </a>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Mensagem</h3>
              <p className="text-base whitespace-pre-wrap">{orcamento.mensagem}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de recebimento</h3>
              <p className="text-base">{formatDate(orcamento.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
