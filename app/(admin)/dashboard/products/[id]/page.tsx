// src/app/(admin)/dashboard/products/[id]/page.tsx
import { ProductForm } from "../_components/product-form"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function EditProductPage({
  // params é assíncrono no Next 15 — aguarde o objeto e só então acesse id
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 1) Gate de auth (opcional se já tem middleware, mas é bom garantir)
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect(`/signin?callbackUrl=/dashboard/products`)
  }

  // 2) params correto
  const { id } = await params

  // 3) Busca direta no Prisma (evita API + JSON + BigInt)
  const product = await prisma.product.findUnique({
    where: { id: BigInt(id) }, // se seu id é BigInt no schema
    include: { images: true },
  })

  if (!product) {
    return <div className="text-muted-foreground">Produto não encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar produto</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm
        mode="edit"
        initial={{
          id: Number(product.id), // ProductForm espera number
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          variant: product.variant as "imported" | "ready",
          price: Number(product.price), // Decimal -> number
          active: product.active,
          featured: product.featured,
          description: product.description ?? "",
        }}
        initialImages={(product.images || []).map((im, i) => ({
          url: im.url,
          alt: im.alt || "",
          position: im.position ?? i,
        }))}
      />
    </div>
  )
}
