import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sample = await prisma.memberships.findFirst();
  console.log("Memberships sample keys:", sample ? Object.keys(sample) : "No record");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
