export function absoluteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  return new URL(path, base).toString()
}
