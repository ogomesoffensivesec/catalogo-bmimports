"use client"

import { useReducer } from "react"
import type { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type MoneyInputProps = {
  form: UseFormReturn<any>
  name: string
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** Formata para pt-BR (BRL) e mantém number no form. */
const moneyFormatter = Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function MoneyInput({
  form,
  name,
  label = "Preço",
  placeholder = "R$ 0,00",
  disabled,
  className,
}: MoneyInputProps) {
  const current = form.getValues()[name]
  const initialValue = current !== undefined && current !== null && current !== ""
    ? moneyFormatter.format(Number(current))
    : ""

  const [value, setValue] = useReducer((_: string, next: string) => {
    const digits = next.replace(/\D/g, "")
    return digits ? moneyFormatter.format(Number(digits) / 100) : ""
  }, initialValue)

  const handleChange = (onChange: (v: number) => void, formatted: string) => {
    const digits = formatted.replace(/\D/g, "")
    onChange(Number(digits || "0") / 100)
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const originalOnChange = field.onChange
        // mostramos string formatada no input…
        field.value = value

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="numeric"
                placeholder={placeholder}
                className={className}
                disabled={disabled}
                {...field}
                onChange={(ev) => {
                  setValue(ev.target.value)              // atualiza string formatada
                  handleChange(originalOnChange, ev.target.value) // salva number no form
                }}
                value={value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
