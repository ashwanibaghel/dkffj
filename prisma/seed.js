const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const teamMembers = [
];

async function main() {
  console.log("Seeding database...");
  for (const m of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
