import { PageHeader } from "@/components/admin/page-header";
import { prisma } from "@/lib/prisma"; 
import { ClientForm, ClientFormValues } from "../../dashboard/products/_components/client-form";

async function getClient(id: string): Promise<ClientFormValues & {id: string} | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { address: true },
    });

    if (!client) return null;

    return {
      ...client,
      address: client.address.length > 0 ? [{ 
        ...client.address[0], 
        streetNumber: Number(client.address[0].streetNumber) 
      }] : undefined
    };
  } catch (error) {
    console.error("Erro ao buscar cliente para edição:", error);
    return null;
  }
}

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);

  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente não encontrado" description="O cliente que você está tentando editar não existe." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar Cliente" description={`Editando: ${client.name}`} />
      <ClientForm mode="edit" initial={client} />
    </div>
  );
}