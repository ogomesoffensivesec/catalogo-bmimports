"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { typedZodResolver } from "@/lib/typed-zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ImageUpload, type ImageItem } from "@/components/admin/image-upload";
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
} from "@/components/ui/select";
import MoneyInput from "@/components/money-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  variant: z.enum(["imported", "ready"]),
  price: z.coerce.number().nonnegative(),
  showPrice: z.boolean().default(true),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  description: z.string().optional(),
});
export type ProductFormValues = z.infer<typeof ProductSchema>;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function ProductForm({
  mode,
  initial,
  initialImages,
}: {
  mode: "create" | "edit";
  initial?: Partial<ProductFormValues> & { id?: number };
  initialImages?: ImageItem[];
}) {
  const router = useRouter();
  const initialVariant = initial?.variant;

  const form = useForm<ProductFormValues>({
    resolver: typedZodResolver<ProductFormValues>(ProductSchema),
    defaultValues: {
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      variant:
        initialVariant === "ready" || initialVariant === "imported"
          ? initialVariant
          : "imported",
      price: Number(initial?.price ?? 0),
      showPrice: initial?.showPrice,
      active: initial?.active ?? true,
      featured: initial?.featured ?? false,
      description: initial?.description ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { isSubmitting },
  } = form;

  const name = watch("name");
  useEffect(() => {
    if (!initial?.slug) setValue("slug", slugify(name || ""));
  }, [name, initial?.slug, setValue]);

  const [images, setImages] = React.useState<ImageItem[]>(initialImages || []);

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    const payload = { ...values, images };
    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Erro ao salvar");
      return;
    }
    router.push("/dashboard/products");
  };

  return (
    <Form {...form}>
      <form
        className="grid gap-6 lg:grid-cols-3"
        onSubmit={handleSubmit(onSubmit)}
        key={initial?.id ?? "create"}
      >
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>SKU</Label>
              <Input
                {...register("sku")}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>

            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                {...register("name")}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>

            <div className="space-y-1">
              <Label>Slug</Label>
              <Input
                {...register("slug")}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>

            <FormField
              control={control}
              name="variant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variante</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a variante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imported">Importados</SelectItem>
                        <SelectItem value="ready">Pronta entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MoneyInput
              form={form}
              name="price"
              label="Preço (R$)"
              placeholder="R$ 0,00"
            />

            <FormField
              control={control}
              name="showPrice" 
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>Mostrar preço?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "sim")}
                      value={field.value ? "sim" : "nao"}
                      className="flex flex-row gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="sim" id="r-sim" />
                        </FormControl>
                        <FormLabel htmlFor="r-sim" className="font-normal">
                          Sim
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="nao" id="r-nao" />
                        </FormControl>
                        <FormLabel htmlFor="r-nao" className="font-normal">
                          Não
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2 space-y-1">
              <Label>Descrição</Label>
              <Textarea
                rows={5}
                {...register("description")}
                className="bg-neutral-950 border-neutral-800"
              />
            </div>
          </div>

          <Separator className="bg-neutral-800" />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label>Ativo</Label>
                  </>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label>Destaque</Label>
                  </>
                )}
              />
            </div>
          </div>

          <Separator className="bg-neutral-800" />

          <div>
            <Label>Imagens</Label>
            <ImageUpload value={images} onChange={setImages} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 font-medium">Ações</h3>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {mode === "create" ? "Criar produto" : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
