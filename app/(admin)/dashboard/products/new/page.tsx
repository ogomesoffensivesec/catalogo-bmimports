// src/app/(admin)/dashboard/products/new/page.tsx
import { ProductForm } from "../_components/product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
        <p className="text-sm text-neutral-400">Crie um item do catálogo</p>
      </div>
      <ProductForm mode="create" />
    </div>
  )
}
