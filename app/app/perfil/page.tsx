"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User } from "lucide-react"

export default function PerfilPage() {
  const { user, perfil, refreshPerfil } = useAuth()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome)
      setEmail(perfil.email)
    }
  }, [perfil])

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (!user?.id) throw new Error("Usuário não autenticado")

      const { error } = await supabase
        .from("usuarios")
        .update({ nome, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (error) throw error

      await refreshPerfil()
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao atualizar perfil",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (novaSenha !== confirmarSenha) {
        throw new Error("As senhas não coincidem")
      }

      if (novaSenha.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres")
      }

      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Senha atualizada com sucesso!" })
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao atualizar senha",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Meu Perfil" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Informações do Perfil</CardTitle>
              </div>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePerfil} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Crie uma nova senha forte com no mínimo 6 caracteres</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSenha} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar Senha"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">ID do Usuário</p>
                <p className="text-sm font-mono">{user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="text-sm">
                  {perfil?.created_at
                    ? new Date(perfil.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
