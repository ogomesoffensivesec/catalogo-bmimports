import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();

  if (!cookieStore.get(process.env.AUTH_COOKIE) && !cookieStore.get(process.env.AUTH_CALLBACK_URL) && !cookieStore.get(process.env.AUTH_CSRF_TOKEN)) {
    return NextResponse.json({ error: "unauthorized", message: "dpiawbndoianbwdawd" }, { status: 401 });
  }

  const since = subDays(new Date(), 14);
  const [
    totalProducts,
    activeProducts,
    totalQuotes,
    quotesSince,
    byVariant,
    recentQuotes,
    topSkus,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.quote.count(),
    prisma.quote.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.quote.groupBy({ by: ["variant"], _count: { _all: true } }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
    prisma.quoteItem.groupBy({
      by: ["sku", "name"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
  ]);

  // series por dia (últimos 14 dias)
  const map = new Map<string, number>();
  for (let i = 14; i >= 0; i--) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    map.set(key, 0);
  }
  quotesSince.forEach((q: any) => {
    const key = format(q.createdAt, "yyyy-MM-dd");
    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
  });
  const quotesSeries = Array.from(map.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const byVariantObj = { imported: 0, ready: 0 } as Record<
    "imported" | "ready",
    number
  >;
  byVariant.forEach((v: any) => {
    byVariantObj[v.variant as "imported" | "ready"] = v._count._all;
  });

  return NextResponse.json({
    totals: { products: totalProducts, activeProducts, quotes: totalQuotes },
    byVariant: byVariantObj,
    quotesSeries,
    recentQuotes: recentQuotes.map((q: any) => ({
      id: String(q.id),
      createdAt: q.createdAt,
      customerName: q.customerName,
      customerEmail: q.customerEmail,
      variant: q.variant,
      items: q.items.length,
    })),
    topSkus: topSkus.map((t: any) => ({
      sku: t.sku,
      name: t.name,
      qty: t._sum.qty || 0,
    })),
  });
}
