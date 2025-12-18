"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export interface Config {
  id: string
  nome_empresa: string
  logo_url?: string
  telefone?: string
  endereco?: string
  email_contato?: string
  horario_funcionamento?: string
  cor_primaria?: string
  cor_secundaria?: string
  cor_destaque?: string
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from("configuracoes").select("*")

      if (error) throw error

      if (data && data.length > 0) {
        setConfig(data[0])
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    loadConfig()
  }

  return { config, loading, refresh }
}
