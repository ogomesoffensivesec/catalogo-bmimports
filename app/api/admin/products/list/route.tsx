import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { safeJson } from "@/lib/safe-json"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  if (!cookieStore.get(process.env.AUTH_COOKIE) && !cookieStore.get(process.env.AUTH_CALLBACK_URL) && !cookieStore.get(process.env.AUTH_CSRF_TOKEN)) {
    return NextResponse.json({ error: "unauthorized", message: "dpiawbndoianbwdawd" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const variant = searchParams.get("variant") as "imported" | "ready" | null
  const take = Number(searchParams.get("take") || 50)
  const skip = Number(searchParams.get("skip") || 0)

  const where: any = {}
  if (variant) where.variant = variant
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { sku: { contains: q, mode: "insensitive" } },
  ]

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { position: "asc" } } },
      skip, take
    }),
    prisma.product.count({ where })
  ])

  return safeJson({ items, total })
}
