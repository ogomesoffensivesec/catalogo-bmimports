// src/lib/allowed-origins.ts
export function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) ?? []
  const dyn = process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []
  const defaults = [
    "http://localhost:5173", // Vite (catálogo)
    "http://127.0.0.1:5173",
    "http://localhost:3000", // Next dev
    "http://127.0.0.1:3000",
    "https://catalogo.bmimports.com.br", // domínio público do catálogo
  ]
  return Array.from(new Set([...defaults, ...env, ...dyn]))
}
