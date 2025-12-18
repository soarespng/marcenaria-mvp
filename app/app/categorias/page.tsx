"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Categoria } from "@/types"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

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
      alert("Erro ao excluir categoria. Verifique se não há produtos vinculados.")
    } else {
      setCategorias(categorias.filter((c) => c.id !== deleteId))
    }
    setDeleteId(null)
  }

  const handleOpenCreate = () => {
    setEditingCategoria(null)
    setFormData({ nome: "", descricao: "" })
    setShowDialog(true)
  }

  const handleOpenEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || "",
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      alert("Nome é obrigatório")
      return
    }

    setSaving(true)

    try {
      const slug = formData.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      if (editingCategoria) {
        // Atualizar
        const { error } = await supabase
          .from("categorias")
          .update({
            nome: formData.nome,
            slug,
            descricao: formData.descricao || null,
          })
          .eq("id", editingCategoria.id)

        if (error) throw error

        setCategorias(
          categorias.map((c) =>
            c.id === editingCategoria.id
              ? { ...c, nome: formData.nome, slug, descricao: formData.descricao || null }
              : c,
          ),
        )
      } else {
        // Criar
        const { data, error } = await supabase
          .from("categorias")
          .insert([
            {
              nome: formData.nome,
              slug,
              descricao: formData.descricao || null,
            },
          ])
          .select()

        if (error) throw error

        if (data && data[0]) {
          setCategorias([...categorias, data[0]])
        }
      }

      setShowDialog(false)
      setFormData({ nome: "", descricao: "" })
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      alert("Erro ao salvar categoria")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppHeader title="Categorias">
        <Button onClick={handleOpenCreate}>
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
            <Button onClick={handleOpenCreate}>
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
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(categoria)}>
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

      {/* Dialog Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingCategoria ? "Atualize as informações da categoria" : "Preencha os dados da nova categoria"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Mesas, Cadeiras, Estantes..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição opcional da categoria"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
