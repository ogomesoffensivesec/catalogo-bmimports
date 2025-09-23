// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { withAuth } from "next-auth/middleware"
import { getAllowedOrigins } from "@/lib/allowed-origins"

// ——— CORS só para /api/public/* ————————————————————————————————
function handleCors(req: NextRequest) {
  const origin = req.headers.get("origin") ?? ""
  const allowed = getAllowedOrigins()
  const isAllowed = origin && allowed.includes(origin)

  // Same-origin? libera
  if (origin && origin === req.nextUrl.origin) return NextResponse.next()

  // Pré-flight
  if (req.method === "OPTIONS") {
    if (!isAllowed) return new NextResponse("CORS origin forbidden", { status: 403 })
    const res = new NextResponse(null, { status: 204 })
    res.headers.set("Access-Control-Allow-Origin", origin)
    res.headers.set("Vary", "Origin")
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    res.headers.set(
      "Access-Control-Allow-Headers",
      req.headers.get("Access-Control-Request-Headers") ?? "Content-Type, Authorization"
    )
    res.headers.set("Access-Control-Allow-Credentials", "true")
    res.headers.set("Access-Control-Max-Age", "86400")
    return res
  }

  // Requests normais
  if (origin && isAllowed) {
    const res = NextResponse.next()
    res.headers.set("Access-Control-Allow-Origin", origin)
    res.headers.set("Vary", "Origin")
    res.headers.set("Access-Control-Allow-Credentials", "true")
    return res
  }

  // Sem Origin (server-to-server) → deixa passar
  return NextResponse.next()
}

// ——— withAuth para proteger rotas privadas ——————————————————————
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl

    // Libera NextAuth (login/logout/callback)
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next()
    }

    // CORS apenas para as rotas públicas
    if (pathname.startsWith("/api/public/")) {
      return handleCors(req)
    }

    // Demais rotas passam; a proteção acontece no callback 'authorized'
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const p = req.nextUrl.pathname
        const isProtected = p.startsWith("/dashboard") || p.startsWith("/api/admin")
        if (!isProtected) return true              // rotas públicas
        return !!token                             // privado → precisa token
      },
    },
  }
)

// ——— escopo do middleware ————————————————————————————————————————
export const config = {
  matcher: [
    "/api/public/:path*",   // CORS
    "/api/admin/:path*",    // protegido por auth
    "/dashboard/:path*",    // protegido por auth
    "/api/auth/:path*",     // deixar passar NextAuth
  ],
}
