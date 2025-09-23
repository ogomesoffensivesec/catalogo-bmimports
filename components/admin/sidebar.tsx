"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, QuoteIcon as Quote, LayoutDashboard } from "lucide-react"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/quotes", label: "Orçamentos", icon: Quote },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="h-14 flex items-center px-4 border-b border-neutral-800">
        <Link href="/dashboard" className="font-semibold tracking-tight">BM Admin</Link>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    "hover:bg-neutral-900",
                    active ? "bg-neutral-900 text-white" : "text-neutral-300",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
