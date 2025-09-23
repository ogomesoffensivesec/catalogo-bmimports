import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
const prisma = new PrismaClient()
async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "marketing@bmimports.com.br" },
    update: {},
    create: {
      email: "marketing@bmimports.com.br",
      name: "Marketing",
      role: "marketing",
      passwordHash
    }
  })
  console.log("seed ok")
}
main().finally(()=>prisma.$disconnect())
