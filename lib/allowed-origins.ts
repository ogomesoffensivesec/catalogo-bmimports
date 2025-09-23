export function getAllowedOrigins(): string[] {
  // vírgulas, sem espaços
  const env = process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) ?? []
  // defaults úteis em dev
  const defaults = [
    "http://localhost:5173",  // Vite
    "http://127.0.0.1:5173",
    "http://localhost:3000",  // Next local
    "http://127.0.0.1:3000",
    "https://catalogo.bmimports.com.br",
  ]
  // evita duplicados
  return Array.from(new Set([...defaults, ...env]))
}
