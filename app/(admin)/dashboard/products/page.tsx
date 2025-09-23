"use client"
import useSWR from "swr"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then(r => r.json())
const PAGE_SIZE = 20

export default function ProductsListPage() {
  const [q, setQ] = useState("")
  const [variant, setVariant] = useState<"imported" | "ready" | "">("")
  const [page, setPage] = useState(1)

  useEffect(()=>{ setPage(1) }, [q, variant])

  const skip = (page - 1) * PAGE_SIZE
  const key = `/api/admin/products/list?q=${encodeURIComponent(q)}&variant=${variant}&take=${PAGE_SIZE}&skip=${skip}`
  const { data, isLoading, mutate } = useSWR(key, fetcher)

  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const pagesToShow = useMemo(() => {
    const arr: (number | "...")[] = []
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) arr.push(i); return arr }
    const set = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages])
    const list = Array.from({ length: totalPages }, (_, i) => i + 1).filter(n => set.has(n) && n >= 1 && n <= totalPages)
    let last = 0
    for (const n of list) { if (last && n - last > 1) arr.push("..."); arr.push(n); last = n }
    return arr
  }, [page, totalPages])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie o catálogo público"
        right={<Button asChild><Link href="/dashboard/products/new">Novo produto</Link></Button>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-64" placeholder="Buscar por nome/SKU…" value={q} onChange={(e)=>setQ(e.target.value)} />
        <select
          value={variant}
          onChange={(e)=>setVariant(e.target.value as any)}
          className="h-10 rounded-md border border-neutral-800 bg-neutral-900 px-2 text-sm"
        >
          <option value="">Todas variantes</option>
          <option value="imported">Importados</option>
          <option value="ready">Pronta entrega</option>
        </select>
      </div>

      <Separator className="bg-neutral-800" />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-neutral-400">Carregando…</TableCell></TableRow>
            )}
            {data?.items?.map((p: any) => (
              <TableRow key={p.id} className="hover:bg-neutral-800/50">
                <TableCell className="font-mono text-xs text-neutral-400">{p.sku}</TableCell>
                <TableCell className="max-w-[380px] truncate">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-neutral-700 text-neutral-300">
                    {p.variant === "ready" ? "Pronta entrega" : "Importado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">R$ {Number(p.price).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={p.active ? "default" : "secondary"}>
                    {p.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild className="border-neutral-700">
                      <Link href={`/dashboard/products/${p.id.toString()}`}>Editar</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async ()=>{
                        if (!confirm("Excluir produto?")) return
                        const res = await fetch(`/api/admin/products/${p.id.toString()}`, { method: "DELETE" })
                        if (res.ok) {
                          toast.success("Produto excluído com sucesso")
                          mutate()
                        } else {
                          toast.error("Erro ao excluir produto")
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.items?.length && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-neutral-400">Nenhum produto</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e)=>{e.preventDefault(); setPage(p=>Math.max(1, p-1))}} />
              </PaginationItem>
              {pagesToShow.map((p, i) => (
                <PaginationItem key={`${p}-${i}`}>
                  {p === "..." ? <PaginationEllipsis /> : (
                    <PaginationLink href="#" isActive={p === page} onClick={(e)=>{e.preventDefault(); setPage(p as number)}}>{p}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e)=>{e.preventDefault(); setPage(p=>Math.min(totalPages, p+1))}} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-xs text-neutral-400">Página {page} de {totalPages} — {total} itens</div>
        </div>
      )}
    </div>
  )
}
