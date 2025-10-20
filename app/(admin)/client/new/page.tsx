import { ClientForm } from "../../dashboard/products/_components/client-form"

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo Cliente</h1>
        <p className="text-sm text-neutral-400">Crie um novo cliente</p>
      </div>
      <ClientForm mode="create" />
    </div>
  )
}