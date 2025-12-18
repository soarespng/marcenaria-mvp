"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { setAuthUser } from "@/lib/auth"
import { isValidEmail } from "@/lib/validators"
import { createUserAccount } from "@/app/actions/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [nome, setNome] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios")
      }

      if (!isValidEmail(email)) {
        throw new Error("Email inválido")
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nome, email, senha_hash, salt")
        .eq("email", email)
        .maybeSingle()

      if (error) {
        throw new Error("Erro ao fazer login")
      }

      if (!data) {
        throw new Error("Email ou senha incorretos")
      }

      if (!crypto?.subtle) {
        throw new Error("Criptografia não disponível neste navegador")
      }

      // Validar senha usando Web Crypto API
      const encoder = new TextEncoder()
      const passwordData = encoder.encode(password + data.salt)
      const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      if (hashHex !== data.senha_hash) {
        throw new Error("Email ou senha incorretos")
      }

      // Salvar apenas dados não sensíveis na sessão
      setAuthUser({
        id: data.id,
        nome: data.nome,
        email: data.email,
      })

      window.location.href = "/app/produtos"
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!email || !password || !nome || !adminPassword) {
        throw new Error("Todos os campos são obrigatórios")
      }

      if (!isValidEmail(email)) {
        throw new Error("Email inválido")
      }

      if (password.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres")
      }

      if (!crypto?.subtle || !crypto?.getRandomValues) {
        throw new Error("Criptografia não disponível neste navegador")
      }

      // Gerar salt e hash da senha usando Web Crypto API
      const saltArray = crypto.getRandomValues(new Uint8Array(16))
      const salt = Array.from(saltArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

      const encoder = new TextEncoder()
      const passwordData = encoder.encode(password + salt)
      const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const senha_hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      const result = await createUserAccount(nome, email, senha_hash, salt, adminPassword)

      if (!result.success) {
        throw new Error(result.error)
      }

      alert("Conta criada com sucesso! Faça login para continuar.")
      setIsSignUp(false)
      setPassword("")
      setNome("")
      setAdminPassword("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sistema de Gestão</CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "Crie sua conta" : "Entre com seu email e senha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Senha de Administrador</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Senha de admin"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">Necessária para criar novas contas</p>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={6}
                />
                {isSignUp && <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Criando conta..." : "Entrando..."}
                  </>
                ) : isSignUp ? (
                  "Criar Conta"
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {isSignUp ? (
                <p>
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setError(null)
                      setNome("")
                      setAdminPassword("")
                    }}
                    className="text-primary underline-offset-4 hover:underline"
                    disabled={isLoading}
                  >
                    Fazer login
                  </button>
                </p>
              ) : (
                <p>
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setError(null)
                    }}
                    className="text-primary underline-offset-4 hover:underline"
                    disabled={isLoading}
                  >
                    Criar conta
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
