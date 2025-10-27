import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const AddressSchema = z.object({
  street: z.string().optional().or(z.literal("")),
  streetNumber: z.coerce.number().int().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipcode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
});

const ClientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  tel: z.string().min(1, "O telefone é obrigatório."),
  cpf: z.string().optional().or(z.literal("")),
  address: AddressSchema.optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();

    if (
      !cookieStore.get(process.env.AUTH_COOKIE) &&
      !cookieStore.get(process.env.AUTH_CALLBACK_URL) &&
      !cookieStore.get(process.env.AUTH_CSRF_TOKEN)
    ) {
      return NextResponse.json(
        { error: "unauthorized", message: "dpiawbndoianbwdawd" },
        { status: 401 }
      );
    }
    const { id } = params;
    const body = await req.json();

    const parsed = ClientSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { address, ...clientData } = parsed.data;

    const updatedClient = await prisma.$transaction(async (prisma) => {
      const client = await prisma.client.update({
        where: { id },
        data: clientData,
      });

      await prisma.address.deleteMany({ where: { clientId: id } });

      if (address && Object.values(address).some((val) => val)) {
        await prisma.address.create({
          data: {
            ...address,
            client: {
              connect: {
                id: id,
              },
            },
          },
        });
      }

      return client;
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar o cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();

    if (
      !cookieStore.get("next-auth.session-token") &&
      !cookieStore.get("next-auth.callback-url")
    ) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Ocorreu um erro ao deletar o cliente, id nao encontrado" },
        { status: 500 }
      );
    }
    const client = await prisma.client.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json(client);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao deletar o cliente" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cookieStore = await cookies();

  if (
    !cookieStore.get("next-auth.session-token") &&
    !cookieStore.get("next-auth.callback-url")
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const client = await prisma.client.findUnique({
      where: {
        id: id,
      },
      include: {
        address: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.log("Erro ao buscar usuários: ", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
