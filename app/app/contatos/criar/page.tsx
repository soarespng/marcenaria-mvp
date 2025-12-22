"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MaskedInput } from "@/components/masked-input"
import { isValidEmail, isValidPhone } from "@/lib/validators"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export default function CriarContatoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    numero: "",
    observacao: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidEmail(formData.email)) {
      toast({
        variant: "destructive",
        title: "Validação",
        description: "Email inválido",
      })
      return
    }

    if (formData.numero && !isValidPhone(formData.numero)) {
      toast({
        variant: "destructive",
        title: "Validação",
        description: "Número de telefone inválido",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("contatos_simples").insert([formData])

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso!",
      })

      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/app/contatos")
    } catch (error) {
      console.error("Erro ao criar contato:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar contato. Tente novamente.",
      })
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader title="Novo Contato">
        <Link href="/app/contatos">
          <Button variant="outline" className="hover:bg-transparent cursor-pointer" >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </AppHeader>

      <div className="p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <MaskedInput
                  id="numero"
                  mask="phone"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  rows={4}
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Link href="/app/contatos">
                  <Button type="button" className="hover:bg-transparent cursor-pointer" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "⏳ Salvando..." : "Criar Contato"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
