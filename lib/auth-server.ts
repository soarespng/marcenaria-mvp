// Server-side authentication utilities
import { cookies } from "next/headers"

const AUTH_TOKEN_KEY = "auth_token"

export async function getAuthTokenServer(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_TOKEN_KEY)?.value || null
}
