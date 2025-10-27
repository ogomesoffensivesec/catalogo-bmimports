// lib/auth.ts
import type { NextAuthOptions, DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import { prisma } from "./prisma"
import bcrypt from "bcrypt"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id?: string }
  }
  interface User {
    id: string
    email: string
    name?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return { id: String(user.id), email: user.email, name: user.name ?? undefined }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) token.uid = (user as { id: string }).id
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.uid === "string" ? token.uid : undefined
      }
      return session
    },
  },
}
