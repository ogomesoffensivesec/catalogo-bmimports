import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productCreateSchema } from "@/lib/dto";
import { safeJson } from "@/lib/safe-json";
import { cookies } from "next/headers";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();

  if (
    !cookieStore.get("next-auth.session-token") &&
    !cookieStore.get("next-auth.callback-url")
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const product = await prisma.product.findUnique({
    where: { id: BigInt(params.id) },
    include: { images: { orderBy: { position: "asc" } } },
  });
  return safeJson(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();

  if (
    !cookieStore.get("next-auth.session-token") &&
    !cookieStore.get("next-auth.callback-url")
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json = await req.json();
  const parsed = productCreateSchema.partial().safeParse(json);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );

  const { images, ...data } = parsed.data;
  const id = BigInt(params.id);
  await prisma.product.update({ where: { id }, data });
  if (images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map((im, i) => ({
          productId: Number(id),
          url: im.url,
          alt: im.alt,
          position: im.position ?? i,
        })),
      });
    }
  }
  return safeJson({ ok: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();

  if (
    !cookieStore.get("next-auth.session-token") &&
    !cookieStore.get("next-auth.callback-url")
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await prisma.product.delete({ where: { id: BigInt(params.id) } });
  return safeJson({ ok: true });
}
