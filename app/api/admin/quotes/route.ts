import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeJson } from "@/lib/safe-json";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  if (!cookieStore.get("next-auth.session-token") && !cookieStore.get("next-auth.callback-url")) {
    console.log("TESTE")
    return NextResponse.json({ error: "unauthorized", message: "dpiawbndoianbwdawd" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const take = Number(searchParams.get("take") || 50);
  const skip = Number(searchParams.get("skip") || 0);

  const [quotes] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      skip,
      take,
    }),
    prisma.quote.count(),
  ]);
  return safeJson(quotes);
}
