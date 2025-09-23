// app/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RootRedirect() {
  const session = await getServerSession(authOptions)
  redirect(session ? "/dashboard" : "/signin")
}
