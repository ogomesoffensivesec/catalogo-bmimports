// src/app/(auth)/signin/page.tsx
"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", { email, password, callbackUrl: "/dashboard", redirect: false })
    setLoading(false)
    if (res?.error) alert("Credenciais inválidas.")
    else window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-950">
      <form
        onSubmit={onSubmit}
        className={cn(
          "w-full max-w-sm rounded-2xl p-6",
          "bg-neutral-900/80 border border-neutral-800 shadow-[0_2px_0_0_rgba(255,255,255,0.04)_inset,0_30px_80px_-20px_rgba(0,0,0,0.65)]"
        )}
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <p className="text-sm text-neutral-400">Acesse o painel administrativo</p>
        </div>

        <div className="space-y-3">
          <Input placeholder="E-mail" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <Input placeholder="Senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <Button className="w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Button>
        </div>
      </form>
    </div>
  )
}
