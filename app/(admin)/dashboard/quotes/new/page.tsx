import { QuoteForm } from "../../products/_components/quote-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo orçamento</h1>
        <p className="text-sm text-neutral-400">Crie um novo orçamento</p>
      </div>
      <QuoteForm mode="create" />
    </div>
  )
}