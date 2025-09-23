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
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
