"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { typedZodResolver } from "@/lib/typed-zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { IMaskInput } from "react-imask";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const AddressSchema = z.object({
  street: z.string().optional().or(z.literal("")),
  streetNumber: z.coerce.number().int().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipcode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

const ClientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  tel: z.string().min(1, "O telefone é obrigatório."),
  cpf: z.string().optional().or(z.literal("")),
  address: AddressSchema.optional(),
});
export type ClientFormValues = z.infer<typeof ClientSchema>;

export function ClientForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<ClientFormValues> & {
    id?: string;
    address?: ClientFormValues["address"][];
  };
}) {
  const router = useRouter();

  const form = useForm<ClientFormValues>({
    resolver: typedZodResolver<ClientFormValues>(ClientSchema),
    defaultValues: {
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      tel: initial?.tel ?? "",
      cpf: initial?.cpf ?? "",
      address: initial?.address?.[0] ?? {
        street: "",
        streetNumber: 0,
        city: "",
        state: "",
        zipcode: "",
        country: "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
    reset,
  } = form;

  const onSubmit: SubmitHandler<ClientFormValues> = async (values) => {
    const payload = {
      ...values,
      address:
        values.address && Object.values(values.address).some((val) => val)
          ? values.address
          : undefined,
    };

    const url =
      mode === "create"
        ? "/api/admin/client"
        : `/api/admin/client/${initial?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      if (!res.ok) {
        const errorData = await res.json();

        let errorMessage = "Erro ao salvar cliente.";
        if (
          errorData.error?.formErrors &&
          errorData.error.formErrors.length > 0
        ) {
          errorMessage = errorData.error.formErrors[0];
        }

        toast.error(errorMessage);
        return;
      }

      toast.success(
        mode === "create"
          ? "Cliente criado com sucesso!"
          : "Cliente atualizado com sucesso!"
      );
      router.push("/client");
      router.refresh();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Ocorreu um erro inesperado.");
    }
  };

  const handleCepComplete = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      setValue("address.street", data.logradouro);
      setValue("address.city", data.localidade);
      setValue("address.state", data.uf);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Não foi possível buscar o CEP.");
    }
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
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-neutral-950 border-neutral-800"
              />
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-neutral-950 border-neutral-800"
              />
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </div>

            <FormField
              control={control}
              name="tel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <IMaskInput
                      mask="(00) 00000-0000"
                      id="tel"
                      value={field.value}
                      onAccept={(value: any) => {
                        field.onChange(value);
                      }}
                      inputRef={field.ref as React.Ref<HTMLInputElement>}
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-neutral-950 border-neutral-800"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <IMaskInput
                      mask="000.000.000-00"
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={field.value || ""}
                      onAccept={(value: any) => {
                        field.onChange(value);
                      }}
                      inputRef={field.ref as React.Ref<HTMLInputElement>}
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-neutral-950 border-neutral-800"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="bg-neutral-800" />

          <h3 className="text-lg font-semibold mb-2">Endereço (Opcional)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="address.zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <IMaskInput
                      mask="00000-000"
                      id="cep"
                      placeholder="00000-000"
                      value={field.value || ""}
                      onAccept={(value: any) => {
                        field.onChange(value);
                      }}
                      onComplete={handleCepComplete}
                      inputRef={field.ref as React.Ref<HTMLInputElement>}
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-neutral-950 border-neutral-800"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1">
              <Label htmlFor="address.street">Rua</Label>
              <Input
                id="address.street"
                {...register("address.street")}
                className="bg-neutral-950 border-neutral-800"
              />
              <FormMessage>
                {form.formState.errors.address?.street?.message}
              </FormMessage>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address.streetNumber">Número</Label>
              <Input
                id="address.streetNumber"
                type="number"
                {...register("address.streetNumber")}
                className="bg-neutral-950 border-neutral-800"
              />
              <FormMessage>
                {form.formState.errors.address?.streetNumber?.message}
              </FormMessage>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address.city">Cidade</Label>
              <Input
                id="address.city"
                {...register("address.city")}
                className="bg-neutral-950 border-neutral-800"
              />
              <FormMessage>
                {form.formState.errors.address?.city?.message}
              </FormMessage>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address.state">Estado</Label>
              <Input
                id="address.state"
                {...register("address.state")}
                className="bg-neutral-950 border-neutral-800"
              />
              <FormMessage>
                {form.formState.errors.address?.state?.message}
              </FormMessage>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 font-medium">Ações</h3>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {mode === "create" ? "Criar cliente" : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
