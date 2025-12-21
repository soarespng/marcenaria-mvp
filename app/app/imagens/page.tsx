"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ProdutoImagem, Produto } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Pencil, Trash2, Loader2, ImageIcon } from "lucide-react"
import Link from "next/link"
import { ConfirmDialog } from "@/components/confirm-dialog"
import Image from "next/image"


interface ImagemComProduto extends ProdutoImagem {
  produto?: Produto
}

export default function ImagensPage() {
  const [imagens, setImagens] = useState<ImagemComProduto[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadImagens()
  }, [])

  const loadImagens = async () => {
    const supabase = createClient()
    setLoading(true)

    const { data, error } = await supabase
      .from("produto_imagens")
      .select(`
        *,
        produto:produtos(id, nome)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar imagens:", error)
    } else {
      setImagens(data || [])
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase.from("produto_imagens").delete().eq("id", deleteId)

    if (error) {
      console.error("Erro ao excluir imagem:", error)
    } else {
      setImagens(imagens.filter((img) => img.id !== deleteId))
    }

    setDeleteId(null)
  }

  return (
    <>
      <AppHeader title="Imagens">
        <Link href="/app/imagens/criar">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Imagem
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : imagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma imagem encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">Comece adicionando sua primeira imagem</p>
            <Link href="/app/imagens/criar">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Imagem
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Ordem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imagens.map((imagem) => (
                  <TableRow key={imagem.id}>
                    <TableCell>
                      <div className="relative h-16 w-16 rounded border">
                        <Image
                          src={imagem.url || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="object-cover rounded"
                          sizes="64px"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate font-mono text-xs">{imagem.url}</TableCell>
                    <TableCell>{imagem.produto?.nome || "-"}</TableCell>
                    <TableCell className="text-center">{imagem.ordem}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/app/imagens/${imagem.id}`}>
                          <Button variant="ghost" className="hover:bg-transparent cursor-pointer" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/imagens/${imagem.id}/editar`}>
                          <Button variant="ghost" className="hover:bg-transparent cursor-pointer" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" className="hover:bg-transparent cursor-pointer" size="icon" onClick={() => setDeleteId(imagem.id)}>
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
        title="Excluir imagem"
        description="Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita."
      />
    </>
  )
}
