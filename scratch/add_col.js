import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE memberships ADD COLUMN IF NOT EXISTS show_home BOOLEAN DEFAULT false;`);
  console.log("Column show_home added/verified successfully in memberships table.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
