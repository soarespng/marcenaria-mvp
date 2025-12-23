// Sistema de autenticação customizado

export interface AuthUser {
  id: string
  nome: string
  email: string
}

const AUTH_STORAGE_KEY = "auth_user"
const AUTH_TOKEN_KEY = "auth_token"

// Client-side functions
export function setAuthUser(user: AuthUser) {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_TOKEN_KEY, `session_${user.id}_${Date.now()}`)

  document.cookie = `${AUTH_TOKEN_KEY}=session_${user.id}_${Date.now()}; path=/; max-age=${60 * 60 * 24 * 7}`
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function clearAuthUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(AUTH_TOKEN_KEY)

  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/app; max-age=0`
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAuthUser()
}

export const AUTH_TOKEN_KEY_EXPORT = AUTH_TOKEN_KEY
