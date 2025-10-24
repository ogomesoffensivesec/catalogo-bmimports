"use client";

import * as React from "react";
import {
  useForm,
  Controller,
  type SubmitHandler,
  useFieldArray,
} from "react-hook-form";
import { z } from "zod";
import { typedZodResolver } from "@/lib/typed-zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import useSWR from "swr";
import { toast } from "sonner";
import { Trash2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const QuoteItemSchema = z.object({
  productId: z.number(),
  sku: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(1, "A quantidade deve ser no mínimo 1."),
  price: z.number(),
});

const QuoteSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente."),
  items: z
    .array(QuoteItemSchema)
    .min(1, "Adicione pelo menos um produto ao orçamento."),
  notes: z.string().optional(),
});
export type QuoteFormValues = z.infer<typeof QuoteSchema>;

type Client = { id: string; name: string, email: string; tel: string };
type Product = { id: number; name: string; sku: string; price: number };

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

export function QuoteForm({ mode }: { mode: "create" | "edit" }) {
  const router = useRouter();

  const { data: clientsData, isLoading: clientsLoading } = useSWR<Client[]>(
    "/api/admin/client",
    fetcher
  );
  const { data: productsData, isLoading: productsLoading } = useSWR<{
    items: Product[];
  }>("/api/admin/products/list", fetcher);

  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = React.useState<number>(1);

  const form = useForm<QuoteFormValues>({
    resolver: typedZodResolver<QuoteFormValues>(QuoteSchema),
    defaultValues: { clientId: "", items: [], notes: "" },
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting, errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleAddItem = () => {
    const productIdNum = Number(selectedProductId);
    if (!productIdNum) {
      toast.warning("Selecione um produto para adicionar.");
      return;
    }
    const productToAdd = productsData?.items.find((p) => p.id == productIdNum);
    if (!productToAdd) return;
    const currentItems = getValues("items");
    const existingItem = currentItems.find(
      (item) => item.productId === productIdNum
    );
    if (existingItem) {
      toast.info(`O produto "${productToAdd.name}" já está no orçamento.`);
      return;
    }

    append({
      productId: Number(productToAdd.id),
      name: productToAdd.name,
      sku: productToAdd.sku,
      quantity: selectedQuantity,
      price: Number(productToAdd.price),
    });
    setSelectedProductId("");
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const onSubmit: SubmitHandler<QuoteFormValues> = async (values) => {
    // 'values' contém { clientId: "...", items: [...] } já validados!


    // 1. Encontre os dados completos do cliente selecionado
    const selectedClient: Client = clientsData?.find(c => c.id === values.clientId);

    const payload = {
      customerName: selectedClient.name,
      customerEmail: selectedClient.email, 
      customerPhone: selectedClient.tel,   
      variant: "ready", 
      items: values.items.map(item => ({ 
        sku: item.sku,
        name: item.name,
        price: item.price,
        qty: item.quantity,
      })),
      notes: values.notes,
    };

    try {

      const res = await fetch("/api/public/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Falha ao enviar orçamento para a API.");
      }
      
      toast.success("Orçamento criado com sucesso!");
      router.push("/dashboard/quotes");

    } catch (error) {
      toast.error("Falha ao criar orçamento.");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(
          onSubmit, 
          (errors) => { 
            console.error("Erros de validação do formulário:", errors);
            toast.error("Por favor, preencha os campos obrigatórios.");
          }
        )}
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 space-y-6 w-full">
            <FormField
              control={control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Label className="mb-1 text-xs font-normal">Selecione o cliente para este orçamento.</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientsLoading && (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      )}
                      {clientsData?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full">
              <Label>Adicionar Produto</Label>
              <Label className="mt-2 text-xs font-normal">Selecione um produto para adicionar ao orçamento.</Label>
              <div className="items-end grid grid-cols-[1fr_auto_auto] gap-1 w-full">
                <div className="flex-1 w-full">
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um produto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productsLoading && (
                        <SelectItem value="loading" disabled>
                          Carregando...
                        </SelectItem>
                      )}
                      {productsData?.items?.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)} className="truncate">
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Label className="text-xs font-normal">Qtd.</Label>
                  <Input
                    type="number"
                    min={1}
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(Number(e.target.value))
                    }
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleAddItem}
                  aria-label="Adicionar Produto"
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
          </div>

          <Separator className="bg-neutral-800" />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Itens no Orçamento</h3>
            {fields.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Nenhum produto adicionado.
              </p>
            ) : (
              <div className="border border-neutral-800 rounded-lg">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 ${
                      index > 0 ? "border-t border-neutral-800" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-neutral-400">
                        {item.quantity} x{" "}
                        {item.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}{" "}
                        ={" "}
                        <strong>
                          {(item.quantity * item.price).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" }
                          )}
                        </strong>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      aria-label="Remover Item"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.items && (
              <p className="text-sm font-medium text-destructive">
                {errors.items.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 font-medium">Ações</h3>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Orçamento"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
