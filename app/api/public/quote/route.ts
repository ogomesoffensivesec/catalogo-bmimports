// app/api/quote/route.ts
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { safeJson } from "@/lib/safe-json"

const QuoteSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  company: z.string().optional(),
  variant: z.enum(["imported", "ready"]),
  items: z.array(z.object({
    id: z.number().int().optional(),
    sku: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    qty: z.number().int().min(1),
    image: z.string().url().optional(),
  })).min(1),
  notes: z.string().optional(), // <- campo do payload
})

type QuotePayload = z.infer<typeof QuoteSchema>
type QuoteItemInput = QuotePayload["items"][number]

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = QuoteSchema.safeParse(json)
  if (!parsed.success) {
    return safeJson({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const { items, ...data } = parsed.data

  const quote = await prisma.$transaction(async (tx) => {
    const q = await tx.quote.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone ?? null,
        company: data.company ?? null,
        variant: data.variant,
        note: data.notes ?? null, // <- mapeia 'notes' do payload para 'note' do Prisma
      },
    })

    await tx.quoteItem.createMany({
      data: items.map((it: QuoteItemInput, idx: number) => ({
        quoteId: Number(q.id),
        sku: it.sku,
        name: it.name,
        price: it.price,
        qty: it.qty,
        image: it.image ?? null,
        position: idx,
      })),
    })

    return q
  })

  return safeJson({ ok: true, id: quote.id })
}
