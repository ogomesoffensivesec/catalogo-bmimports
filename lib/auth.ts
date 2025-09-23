import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"
import { Adapter } from "next-auth/adapters"
import { z } from "zod"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const schema = z.object({ email: z.string().email(), password: z.string().min(3) })
        const parsed = schema.safeParse(credentials)
        if (!parsed.success) return null
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
        if (!user?.passwordHash) return null
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.name ?? "", email: user.email ?? "", role: user.role } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role || "marketing"
      return token
    },
    async session({ session, token }) {
      (session as any).user.role = token.role
      return session
    }
  }
}
