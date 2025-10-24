// src/app/layout.tsx
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "BM Admin",
  description: "Painel administrativo",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <meta name="facebook-domain-verification" content="nev8nrijbzbytsjbgq50qytq0b58ic" />
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
