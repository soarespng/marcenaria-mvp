"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Categoria } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

export default function CategoriasPage() {
  const router = useRouter()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("categorias").select("*").order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao carregar categorias:", error)
    } else {
      setCategorias(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const { error } = await supabase.from("categorias").delete().eq("id", deleteId)

    if (error) {
      console.error("Erro ao excluir categoria:", error)
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Erro ao excluir categoria. Verifique se não há produtos vinculados.",
      })
    } else {
      setCategorias(categorias.filter((c) => c.id !== deleteId))
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      })
    }
    setDeleteId(null)
  }

  return (
    <>
      <AppHeader title="Categorias">
        <Button onClick={() => router.push("/app/categorias/criar")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </AppHeader>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : categorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece criando sua primeira categoria</p>
            <Button onClick={() => router.push("/app/categorias/criar")}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Categoria
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell className="font-medium">{categoria.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{categoria.slug}</TableCell>
                    <TableCell className="max-w-md truncate">{categoria.descricao || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/app/categorias/${categoria.id}/editar`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(categoria.id)}>
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

      {/* Confirm Delete */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir categoria"
        description="Tem certeza que deseja excluir esta categoria? Produtos vinculados a ela ficarão sem categoria."
      />
    </>
  )
}
