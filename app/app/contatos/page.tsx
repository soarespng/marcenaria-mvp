"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ContatoSimples } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2, Loader2, Users, Pencil, Plus } from "lucide-react"
import Link from "next/link"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function ContatosPage() {
  const [contatos, setContatos] = useState<ContatoSimples[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadContatos()
  }, [])

  const loadContatos = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase
      .from("contatos_simples")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar contatos:", error)
    } else {
      setContatos(data || [])
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("contatos_simples").delete().eq("id", deleteId)

    if (error) {
      console.error("Erro ao excluir contato:", error)
    } else {
      setContatos(contatos.filter((c) => c.id !== deleteId))
    }

    setDeleteId(null)
  }

  return (
    <>
      <AppHeader title="Contatos">
        <Link href="/app/contatos/criar">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contato
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : contatos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum contato cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece adicionando seu primeiro contato</p>
            <Link href="/app/contatos/criar">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contato
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contatos.map((contato) => (
                  <TableRow key={contato.id}>
                    <TableCell className="font-medium">{contato.nome}</TableCell>
                    <TableCell>{contato.email}</TableCell>
                    <TableCell>{contato.numero || "-"}</TableCell>
                    <TableCell className="max-w-md truncate">{contato.observacao || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/app/contatos/${contato.id}`}>
                          <Button variant="ghost" size="icon" className="hover:bg-transparent cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/contatos/${contato.id}/editar`}>
                          <Button variant="ghost" size="icon" className="hover:bg-transparent cursor-pointer">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(contato.id)}
                          className="hover:bg-transparent cursor-pointer"
                        >
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
        title="Excluir contato"
        description="Tem certeza que deseja excluir este contato? Esta ação não pode ser desfeita."
      />
    </>
  )
}
