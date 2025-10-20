"use client";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ExportToExcelButton from "../products/_components/excel-component";
import { PageHeader } from "@/components/admin/page-header";

type QuoteItem = {
  sku: string;
  name: string;
  price: string;
  qty: number;
};

type Quote = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  variant: "ready" | "imported";
  items: QuoteItem[];
  note: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function QuotesPage() {
  const { data, isLoading } = useSWR("/api/admin/quotes?take=100", fetcher);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos/Pedidos"
        description="Entradas do checkout"
        right={
          <Button asChild>
            <Link href="/dashboard/quotes/new">Novo orçamento</Link>
          </Button>
        }
      />

      <div className="rounded-lg border border-neutral-800 bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-neutral-400"
                >
                  Carregando…
                </TableCell>
              </TableRow>
            )}
            {data?.map((q) => {
              const subtotal = q.items.reduce(
                (acc, item) => acc + Number(item.price) * (item.qty || 1),
                0
              );
              return (
                <TableRow key={q.id} className="hover:bg-neutral-800/50">
                  <TableCell className="text-sm text-neutral-300">
                    {formatDate(q.createdAt)}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {q.customerName}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-neutral-400">
                    {q.customerEmail}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-neutral-700 text-neutral-300"
                    >
                      {q.variant === "ready" ? "Pronta entrega" : "Importado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {q.items?.length || 0}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="text-sm text-neutral-400 cursor-pointer hover:bg-neutral-800 hover:text-neutral-100"
                        >
                          Visualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl bg-neutral-900 border-neutral-800 text-neutral-50">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">
                            Detalhes do Pedido #{q.id}
                          </DialogTitle>
                          <DialogDescription>
                            Recebido em {formatDate(q.createdAt)}. Categoria:{" "}
                            <span className="font-semibold text-neutral-300">
                              {q.variant === "ready"
                                ? "Pronta Entrega"
                                : "Importados"}
                            </span>
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-neutral-300">
                              Dados do Cliente
                            </h4>
                            <div className="text-sm text-neutral-400 space-y-1">
                              <p>
                                <strong>Nome:</strong> {q.customerName}
                              </p>
                              <p>
                                <strong>E-mail:</strong> {q.customerEmail}
                              </p>
                              {q.customerPhone && (
                                <p>
                                  <strong>Telefone:</strong> {q.customerPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          <Separator className="bg-neutral-800" />
                          <div className="space-y-3">
                            <h4 className="font-semibold text-neutral-300">
                              Itens
                            </h4>
                            <div className="space-y-3">
                              {q.items.map((item) => (
                                <div
                                  key={item.sku}
                                  className="flex justify-between items-start text-sm border-b border-neutral-800 pb-2"
                                >
                                  <div>
                                    <p className="font-medium text-neutral-200">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      SKU: {item.sku}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-neutral-200">
                                      {formatBRL(
                                        Number(item.price) * (item.qty || 1)
                                      )}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                      {item.qty || 1} x{" "}
                                      {formatBRL(Number(item.price))}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {q.note && (
                            <>
                              <Separator className="bg-neutral-800" />
                              <div className="space-y-2">
                                <h4 className="font-semibold text-neutral-300">
                                  Observações
                                </h4>
                                <p className="text-sm text-neutral-400 bg-neutral-800/50 p-3 rounded-md">
                                  {q.note}
                                </p>
                              </div>
                            </>
                          )}
                          <Separator className="bg-neutral-800" />
                          <div className="flex justify-end items-center text-lg sticky bottom-0 bg-neutral-900 py-2">
                            <span className="text-neutral-400 mr-2">
                              Total:
                            </span>
                            <span className="font-bold text-xl text-white">
                              {formatBRL(subtotal)}
                            </span>
                          </div>
                        </div>
                        <DialogFooter className="flex justify-between w-full">
                          <ExportToExcelButton
                            quote={q}
                            fileName={`detalhes-pedido-${q.id}`}
                          />
                          <DialogClose asChild>
                            <Button type="button" variant="secondary">
                              Fechar
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && !data?.length && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-neutral-400"
                >
                  Nenhum registro
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
