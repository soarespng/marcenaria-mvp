"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Produto } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Pencil, Trash2, Loader2, Package } from "lucide-react"
import Link from "next/link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useRouter } from "next/navigation"

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase.from("produtos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar produtos:", error)
    } else {
      setProdutos(data || [])
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("produtos").delete().eq("id", deleteId)

    if (error) {
      console.error("Erro ao excluir produto:", error)
    } else {
      setProdutos(produtos.filter((p) => p.id !== deleteId))
    }

    setDeleteId(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <>
      <AppHeader title="Produtos">
        <Link href="/app/produtos/criar">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece criando seu primeiro produto</p>
            <Link href="/app/produtos/criar">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Produto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell className="max-w-md truncate">{produto.descricao || "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(produto.preco)}</TableCell>
                    <TableCell className="text-right">{produto.estoque}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/app/produtos/${produto.id}`}>
                          <Button variant="ghost" size="icon" className="hover:bg-transparent cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/produtos/${produto.id}/editar`}>
                          <Button variant="ghost" size="icon" className="hover:bg-transparent cursor-pointer">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(produto.id)}
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
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />
    </>
  )
}
