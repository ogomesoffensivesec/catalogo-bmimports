
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "BvUVRdBhxvdt";
  const hashPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: "marketing@bmimports.com.br" },
    data: {
       passwordHash: hashPassword,
    },
  });

  console.log("Senha redefinida com sucesso para marketing@bmimports.com.br");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
