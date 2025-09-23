"use client"
import useSWR from "swr"
import { PageHeader } from "@/components/admin/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/admin/summary", fetcher)

  const totals = data?.totals || { products: 0, activeProducts: 0, quotes: 0 }
  const quotesSeries = data?.quotesSeries || []
  const byVariant = data?.byVariant || { imported: 0, ready: 0 }
  const recent = data?.recentQuotes || []
  const topSkus = data?.topSkus || []

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral do catálogo e orçamentos" />

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Total de produtos</CardTitle></CardHeader>
          <CardContent className="text-3xl">{totals.products}</CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Produtos ativos</CardTitle></CardHeader>
          <CardContent className="text-3xl">{totals.activeProducts}</CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Orçamentos totais</CardTitle></CardHeader>
          <CardContent className="text-3xl">{totals.quotes}</CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
          <CardHeader><CardTitle>Orçamentos nos últimos 15 dias</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quotesSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="currentColor" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Por variante</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: "Importados", value: byVariant.imported }, { name: "Pronta entrega", value: byVariant.ready }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recentes & Top SKUs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Orçamentos recentes</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border border-neutral-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Data</TableHead><TableHead>Cliente</TableHead><TableHead>Variante</TableHead><TableHead>Itens</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-6 text-neutral-400">Carregando…</TableCell></TableRow>}
                  {recent.map((q: any) => (
                    <TableRow key={q.id} className="hover:bg-neutral-800/50">
                      <TableCell className="text-sm">{new Date(q.createdAt).toLocaleString("pt-BR")}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{q.customerName}</TableCell>
                      <TableCell><Badge variant="outline" className="border-neutral-700">{q.variant === "ready" ? "Pronta entrega" : "Importado"}</Badge></TableCell>
                      <TableCell>{q.items}</TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && !recent.length && <TableRow><TableCell colSpan={4} className="text-center py-6 text-neutral-400">Nada por aqui</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Top SKUs por Qtd</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border border-neutral-800 overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>SKU</TableHead><TableHead>Produto</TableHead><TableHead>Qtd</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading && <TableRow><TableCell colSpan={3} className="text-center py-6 text-neutral-400">Carregando…</TableCell></TableRow>}
                  {data?.topSkus?.map((t: any) => (
                    <TableRow key={t.sku} className="hover:bg-neutral-800/50">
                      <TableCell className="font-mono text-xs text-neutral-400">{t.sku}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{t.name}</TableCell>
                      <TableCell>{t.qty}</TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && !topSkus.length && <TableRow><TableCell colSpan={3} className="text-center py-6 text-neutral-400">Nada por aqui</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
