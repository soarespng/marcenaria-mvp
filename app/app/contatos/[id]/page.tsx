"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { ContatoSimples } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mail, Phone, Pencil } from "lucide-react"
import Link from "next/link"

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export default function VerContatoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [contato, setContato] = useState<ContatoSimples | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id === "criar") {
      router.push("/app/contatos/criar")
      return
    }

    if (!isValidUUID(id)) {
      setLoading(false)
      return
    }

    loadContato()
  }, [id])

  const loadContato = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase.from("contatos_simples").select("*").eq("id", id).single()

    if (error) {
      console.error("Erro ao carregar contato:", error)
    } else {
      setContato(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Detalhes do Contato" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!contato) {
    return (
      <>
        <AppHeader title="Contato não encontrado" />
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">O contato solicitado não foi encontrado.</p>
              <div className="flex justify-center mt-4">
                <Link href="/app/contatos">
                  <Button variant="outline" className="hover:bg-transparent cursor-pointer" >
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
      <AppHeader title="Detalhes do Contato">
        <Link href={`/app/contatos/${id}/editar`}>
          <Button variant="outline" className="hover:bg-transparent cursor-pointer" >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
        <Link href="/app/contatos">
          <Button variant="outline" className="hover:bg-transparent cursor-pointer" >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{contato.nome}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
              <a
                href={`mailto:${contato.email}`}
                className="text-base text-primary hover:underline flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {contato.email}
              </a>
            </div>

            {contato.numero && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Número</h3>
                <a
                  href={`tel:${contato.numero}`}
                  className="text-base text-primary hover:underline flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {contato.numero}
                </a>
              </div>
            )}

            {contato.observacao && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Observação</h3>
                <p className="text-base whitespace-pre-wrap">{contato.observacao}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
