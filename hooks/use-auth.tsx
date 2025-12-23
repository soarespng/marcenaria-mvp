"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Usuario } from "@/types"
import { getAuthUser, clearAuthUser, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  perfil: Usuario | null
  loading: boolean
  signOut: () => Promise<void>
  refreshPerfil: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchPerfil = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("usuarios").select("*").eq("id", userId).maybeSingle()

      if (error) {
        return
      }

      if (data) {
        setPerfil(data)
      }
    } catch (err) {}
  }

  const refreshPerfil = async () => {
    if (user?.id) {
      await fetchPerfil(user.id)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authUser = getAuthUser()

        if (authUser) {
          setUser(authUser)
          await fetchPerfil(authUser.id)
        }
      } catch (err) {
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signOut = async () => {
    clearAuthUser()
    setUser(null)
    setPerfil(null)
    router.replace("/login")
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signOut, refreshPerfil }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
