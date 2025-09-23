import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/products?variant=imported|ready
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const variant = searchParams.get("variant") as "imported"|"ready" | null
  const where: any = { active: true }
  if (variant) where.variant = variant

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { position: "asc" } } }
  })
  // cache curto (se quiser)
  return NextResponse.json(products, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } })
}
