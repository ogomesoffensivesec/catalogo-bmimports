import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Payload = {
  variant: "imported" | "ready"
  customer: { name: string; email: string; phone?: string; company?: string; cnpj?: string; address?: string; note?: string }
  items: { sku: string; name: string; price: number; qty: number; productId?: number }[]
  subtotal: number
}

async function sendEmail(payload: Payload) {
  // RESEND
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const html = buildHtml(payload)
    await resend.emails.send({
      from: process.env.SMTP_FROM || "BM Imports <noreply@bmimports.com>",
      to: ["vendas@bmimports.com.br"],
      subject: `${payload.variant === "ready" ? "Pedido" : "Orçamento"} - ${payload.customer.name}`,
      html
    })
    return
  }
  // SMTP
  const nodemailer = (await import("nodemailer")).default
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: "vendas@bmimports.com.br",
    subject: `${payload.variant === "ready" ? "Pedido" : "Orçamento"} - ${payload.customer.name}`,
    html: buildHtml(payload)
  })
}

function buildHtml(p: Payload) {
  const rows = p.items.map((it, i) =>
    `<tr><td style="padding:8px">${i+1}</td><td style="padding:8px">${it.name}<br/><small>SKU: ${it.sku}</small></td><td style="padding:8px;text-align:center">${it.qty}</td><td style="padding:8px">R$ ${it.price.toFixed(2)}</td><td style="padding:8px">R$ ${(it.price*it.qty).toFixed(2)}</td></tr>`
  ).join("")
  return `
  <div style="font-family:Arial,sans-serif">
    <h2>${p.variant === "ready" ? "Pedido" : "Solicitação de orçamento"}</h2>
    <p><b>Cliente:</b> ${p.customer.name} — ${p.customer.email}</p>
    <p><b>Telefone:</b> ${p.customer.phone || "-"} | <b>Empresa:</b> ${p.customer.company || "-"}</p>
    <p><b>CNPJ:</b> ${p.customer.cnpj || "-"} | <b>Endereço:</b> ${p.customer.address || "-"}</p>
    ${p.customer.note ? `<p><b>Observações:</b> ${p.customer.note}</p>` : ""}
    <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:12px 0">
      <thead><tr><th>#</th><th>Produto</th><th>Qtd</th><th>Unit.</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><b>Subtotal:</b> R$ ${p.subtotal.toFixed(2)}</p>
  </div>`
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload
  // salva no banco
  const quote = await prisma.quote.create({
    data: {
      variant: body.variant,
      customerName: body.customer.name,
      customerEmail: body.customer.email,
      customerPhone: body.customer.phone,
      company: body.customer.company,
      cnpj: body.customer.cnpj,
      address: body.customer.address,
      note: body.customer.note,
      items: {
        create: body.items.map(it => ({
          productId: it.productId ? BigInt(it.productId) : undefined,
          sku: it.sku, name: it.name, price: it.price, qty: it.qty
        }))
      }
    }
  })
  await sendEmail(body)
  return NextResponse.json({ ok: true, id: quote.id })
}
