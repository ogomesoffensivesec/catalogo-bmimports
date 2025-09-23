// src/lib/typed-zod-resolver.ts
import type { FieldValues, Resolver } from "react-hook-form"
import type { ZodTypeAny } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

/**
 * Wrapper permissivo: apaga os generics do zodResolver na chamada
 * (resolve Overload/FieldValues incompatíveis em alguns setups).
 */
export function typedZodResolver<TFieldValues extends FieldValues>(
  schema: ZodTypeAny
): Resolver<TFieldValues> {
  // apaga tipos no call-site para evitar Overload mismatch
  const r = (zodResolver as unknown as (s: unknown) => unknown)(schema)
  return r as Resolver<TFieldValues>
}
