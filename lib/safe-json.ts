export function safeJson(data: any, init?: ResponseInit) {
  // Converte BigInt/Decimal/etc. recursivamente para strings/numbers seguros
  const body = JSON.stringify(
    data,
    (_key, value) => {
      if (typeof value === "bigint") return value.toString()
      // Se você usa Prisma.Decimal:
      if (value?.constructor?.name === "Decimal") return Number(value)
      return value
    }
  )
  return new Response(body, {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers || {}) },
  })
}
