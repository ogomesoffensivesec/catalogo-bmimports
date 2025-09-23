import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAllowedOrigins } from "@/lib/allowed-origins"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // aplique só em rotas de API (ajuste se quiser restringir/mudar)
  if (!pathname.startsWith("/api/")) return NextResponse.next()

  const origin = req.headers.get("origin") ?? ""
  const allowed = getAllowedOrigins()

  // pré-flight CORS
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 })
    if (origin && allowed.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin)
      res.headers.set("Vary", "Origin")
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
      res.headers.set(
        "Access-Control-Allow-Headers",
        req.headers.get("Access-Control-Request-Headers") ?? "Content-Type, Authorization"
      )
      // habilite se for usar cookies com cross-site:
      res.headers.set("Access-Control-Allow-Credentials", "true")
      res.headers.set("Access-Control-Max-Age", "86400")
      return res
    }
    // origin não permitido
    return new NextResponse("CORS origin forbidden", { status: 403 })
  }

  // requisições normais
  // navegadores enviam "Origin" em fetch/XHR; navegações e server-to-server podem não enviar
  if (origin) {
    if (!allowed.includes(origin)) {
      return new NextResponse("CORS origin forbidden", { status: 403 })
    }
    const res = NextResponse.next()
    res.headers.set("Access-Control-Allow-Origin", origin)
    res.headers.set("Vary", "Origin")
    // habilite se precisa cookies cross-site:
    res.headers.set("Access-Control-Allow-Credentials", "true")
    return res
  }

  // sem header Origin ⇒ geralmente same-origin (navegação) ou server-to-server
  // se quiser bloquear TUDO que não venha dos frontends, troque para 403 aqui.
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
