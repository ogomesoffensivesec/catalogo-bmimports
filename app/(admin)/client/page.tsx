"use client"
import useSWR from "swr"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())
const PAGE_SIZE = 20

type Client = {
  id: string;
  name: string;
  email: string;
  tel: string;
  cpf?: string | null;
  createdAt: string;
};

// Função para formatar a data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};


export default function ClientsPage() {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [q])

  const skip = (page - 1) * PAGE_SIZE
  const key = `/api/admin/client?q=${encodeURIComponent(q)}&take=${PAGE_SIZE}&skip=${skip}`
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
        title="Clientes"
        description="Gerencie sua base de clientes"
        right={<Button asChild><Link href="/client/new">Novo cliente</Link></Button>}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-64" placeholder="Buscar por nome/e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Separator className="bg-neutral-800" />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-neutral-400">Carregando clientes…</TableCell></TableRow>
            )}
            {data?.map((c: Client) => (
              <TableRow key={c.id} className="hover:bg-neutral-800/50">
                <TableCell className="max-w-[300px] truncate font-medium">{c.name}</TableCell>
                <TableCell className="text-neutral-400">{c.email}</TableCell>
                <TableCell className="text-neutral-400">{c.tel}</TableCell>
                <TableCell className="font-mono text-xs text-neutral-400">{c.cpf || "N/A"}</TableCell>
                <TableCell className="text-neutral-400">{formatDate(c.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild className="border-neutral-700">
                      <Link href={`/client/${c.id}`}>Editar</Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      size="sm"
                      onClick={async () => {
                        if (!confirm(`Excluir cliente "${c.name}"?`)) return
                        const res = await fetch(`/api/admin/client/${c.id}`, { method: "DELETE" })
                        if (res.ok) {
                          toast.success("Cliente excluído com sucesso")
                          mutate()
                        } else {
                          toast.error("Erro ao excluir cliente")
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.length && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-neutral-400">Nenhum cliente encontrado</TableCell></TableRow>
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
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }} />
              </PaginationItem>
              {pagesToShow.map((p, i) => (
                <PaginationItem key={`${p}-${i}`}>
                  {p === "..." ? <PaginationEllipsis /> : (
                    <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p as number) }}>{p}</PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)) }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-xs text-neutral-400">Página {page} de {totalPages} — {total} clientes</div>
        </div>
      )}
    </div>
  )
}