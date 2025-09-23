"use client"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CircleUserRound } from "lucide-react"

export function Topbar() {
  const { data, status } = useSession()
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70 bg-neutral-950/90">
      <div className="mx-auto max-w-screen-2xl h-full px-4 flex items-center justify-between">
        <div className="text-sm text-neutral-400">Painel administrativo</div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-300">
            <CircleUserRound className="size-4" />
            {status === "authenticated" ? (data?.user?.email ?? "usuário") : "…"}
          </div>
          <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/signin" })}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
