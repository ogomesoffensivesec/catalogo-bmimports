// src/components/admin/shell.tsx
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-200">
      <Topbar />
      <div className="mx-auto max-w-screen-2xl grid grid-cols-1 md:grid-cols-[256px_1fr]">
        <Sidebar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
