import { getAuthTokenServer } from "@/lib/auth-server"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const authToken = await getAuthTokenServer()

  // Redirecionar para login se tentar acessar /app sem estar autenticado
  if (request.nextUrl.pathname.startsWith("/app") && !authToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirecionar para /app/produtos se já estiver autenticado e tentar acessar /login
  if (request.nextUrl.pathname === "/login" && authToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/app/produtos"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
