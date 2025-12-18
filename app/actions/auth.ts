"use server"

import { createClient } from "@/lib/supabase/server"

const ADMIN_SIGNUP_PASSWORD = process.env.ADMIN_SIGNUP_PASSWORD || "admin123"

export async function createUserAccount(
  nome: string,
  email: string,
  senha_hash: string,
  salt: string,
  adminPassword: string,
) {
  try {
    if (adminPassword !== ADMIN_SIGNUP_PASSWORD) {
      return { success: false, error: "Senha de administrador incorreta" }
    }

    const supabase = await createClient()

    // Verificar se email já existe
    const { data: existingUser } = await supabase.from("usuarios").select("email").eq("email", email).maybeSingle()

    if (existingUser) {
      return { success: false, error: "Email já cadastrado" }
    }

    // Inserir novo usuário
    const { error } = await supabase.from("usuarios").insert({
      nome,
      email,
      senha_hash,
      salt,
    })

    if (error) {
      console.error("Erro ao criar usuário:", error)
      return { success: false, error: "Erro ao criar conta" }
    }

    return { success: true }
  } catch (error) {
    console.error("Erro na criação de conta:", error)
    return { success: false, error: "Erro inesperado ao criar conta" }
  }
}
