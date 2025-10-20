import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { safeJson } from "@/lib/safe-json"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()

  if (!cookieStore.get("next-auth.session-token") && !cookieStore.get("next-auth.callback-url")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json()
  const { images = [], ...data } = body as any

  // Calcula próximo orderIndex (por variante) dentro de uma transação
  const created = await prisma.$transaction(async (tx: any) => {
    const max = await tx.product.aggregate({
      where: { variant: data.variant },
      _max: { orderIndex: true },
    })
    const nextOrder = (max._max.orderIndex ?? -1) + 1

    const p = await tx.product.create({
      data: { ...data, orderIndex: nextOrder },
    })

    if (images?.length) {
      await tx.productImage.createMany({
        data: images.map((im: any, i: number) => ({
          productId: Number(p.id),
          url: im.url,
          alt: im.alt || null,
          position: im.position ?? i,
        })),
      })
    }
    return p
  })

  return safeJson({ ok: true, id: created.id })
}
