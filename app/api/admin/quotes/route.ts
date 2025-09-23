import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { safeJson } from "@/lib/safe-json"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const take = Number(searchParams.get("take") || 50)
  const skip = Number(searchParams.get("skip") || 0)

  const [items, total] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      skip, take
    }),
    prisma.quote.count()
  ])

  return safeJson({ items, total })
}
