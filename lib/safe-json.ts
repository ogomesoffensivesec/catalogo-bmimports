// lib/safe-json.ts
export function safeJson<T>(data: T, init?: ResponseInit): Response {
  const body = JSON.stringify(data, (_key, value) => {
    if (typeof value === "bigint") return value.toString()
    if (value?.constructor?.name === "Decimal") return Number(value as unknown as { toNumber(): number })
    return value
  })
  return new Response(body, {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers || {}) },
  })
}
