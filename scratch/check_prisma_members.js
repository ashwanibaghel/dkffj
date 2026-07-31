const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.memberships.count();
  console.log("Total memberships in SQLite prisma DB:", count);
  const sample = await prisma.memberships.findMany({ take: 20 });
  console.log("Sample records from prisma DB:");
  sample.forEach(m => console.log(`- ${m.ack_no} | ${m.full_name} | status: ${m.status}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
