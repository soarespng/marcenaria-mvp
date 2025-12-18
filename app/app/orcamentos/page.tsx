"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Contato } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadOrcamentos()
  }, [])

  const loadOrcamentos = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase.from("contatos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar orçamentos:", error)
    } else {
      setOrcamentos(data || [])
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("contatos").delete().eq("id", deleteId)

    if (error) {
      console.error("Erro ao excluir orçamento:", error)
    } else {
      setOrcamentos(orcamentos.filter((c) => c.id !== deleteId))
    }

    setDeleteId(null)
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

  return (
    <>
      <AppHeader title="Orçamentos" />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orcamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum orçamento encontrado</h3>
            <p className="text-sm text-muted-foreground">Quando você receber solicitações, elas aparecerão aqui</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium">{orcamento.nome}</TableCell>
                    <TableCell>{orcamento.email}</TableCell>
                    <TableCell className="max-w-md truncate">{orcamento.mensagem}</TableCell>
                    <TableCell>{formatDate(orcamento.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/app/orcamentos/${orcamento.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(orcamento.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir orçamento"
        description="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
      />
    </>
  )
}
