import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const AddressSchema = z.object({
  street: z.string().min(1, "O nome da rua é obrigatório."),
  streetNumber: z.coerce.number().int(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),
});

const ClientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z
    .string()
    .email("O e-mail fornecido é inválido.")
    .optional()
    .or(z.literal("")),
  tel: z.string().min(1),
  cpf: z.string().optional(),
  address: AddressSchema.optional(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    if (
      !cookieStore.get("next-auth.session-token") &&
      !cookieStore.get("next-auth.callback-url")
    ) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = ClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { address, ...clientData } = parsed.data;

    const newClient = await prisma.client.create({
      data: {
        name: clientData.name,
        email: clientData.email,
        tel: clientData.tel,
        cpf: clientData.cpf,
        address: address
          ? {
              create: {
                street: address.street,
                streetNumber: address.streetNumber,
                city: address.city,
                state: address.state,
                zipcode: address.zipcode,
                country: address.country,
              },
            }
          : undefined,
      },
      include: { address: true },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    if (
      !cookieStore.get("next-auth.session-token") &&
      !cookieStore.get("next-auth.callback-url")
    ) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const where: any = {};
    if (q)
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    const clients = await prisma.client.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
      include: { address: true },
    });

    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.log("Erro ao buscar usuários: ", error);
    console.log("Nenhuma sessão encontrada. O usuário não está logado.");

    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
