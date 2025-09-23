// src/app/(admin)/dashboard/quotes/page.tsx
"use client"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function QuotesPage() {
  const { data, isLoading } = useSWR("/api/admin/quotes?take=100", fetcher)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orçamentos/Pedidos</h1>
        <p className="text-sm text-neutral-400">Entradas do checkout</p>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead>Itens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center py-8 text-neutral-400">Carregando…</TableCell></TableRow>}
            {data?.items?.map((q: any) => (
              <TableRow key={q.id} className="hover:bg-neutral-800/50">
                <TableCell className="text-sm text-neutral-300">{new Date(q.createdAt).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="max-w-[240px] truncate">{q.customerName}</TableCell>
                <TableCell className="max-w-[240px] truncate text-neutral-400">{q.customerEmail}</TableCell>
                <TableCell><Badge variant="outline" className="border-neutral-700 text-neutral-300">{q.variant === "ready" ? "Pronta entrega" : "Importado"}</Badge></TableCell>
                <TableCell className="text-sm">{q.items?.length || 0}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.items?.length && <TableRow><TableCell colSpan={5} className="text-center py-8 text-neutral-400">Nenhum registro</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
