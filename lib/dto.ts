import { z } from "zod"
export const productCreateSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  variant: z.enum(["imported","ready"]),
  price: z.coerce.number().nonnegative(),
  showPrice: z.boolean(),
  description: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  orderIndex: z.coerce.number().int().default(0),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional(), position: z.number().int().default(0)})).default([])
})
export type ProductCreate = z.infer<typeof productCreateSchema>
