"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"

export function AutoBreadcrumbs() {
  const pathname = usePathname()
  const parts = (pathname || "/").split("/").filter(Boolean)
  const items = parts.map((p, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/")
    const label = p.replace(/-/g, " ")
    return { href, label }
  })
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
        {items.slice(1).map((it, idx) => (
          <span key={it.href} className="flex items-center">
            <BreadcrumbSeparator />
            {idx === items.length - 2 ? (
              <BreadcrumbPage className="capitalize">{it.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbItem><BreadcrumbLink asChild><Link className="capitalize" href={it.href}>{it.label}</Link></BreadcrumbLink></BreadcrumbItem>
            )}
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
