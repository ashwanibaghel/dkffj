const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const member = await prisma.memberships.findFirst({
    where: {
      OR: [
        { membership_no: { contains: '1152' } },
        { ack_no: { contains: '1152' } }
      ]
    }
  });

  console.log("=== MEMBER 1152 RECORD IN DB ===");
  console.log(member);

  const allWith1152 = await prisma.memberships.findMany({
    where: {
      OR: [
        { membership_no: { contains: '1152' } },
        { ack_no: { contains: '1152' } }
      ]
    }
  });

  console.log("All records matching 1152:", allWith1152.length);
  allWith1152.forEach(m => {
    console.log({
      id: m.id,
      membership_no: m.membership_no,
      ack_no: m.ack_no,
      status: m.status,
      full_name: m.full_name
    });
  });
}

main().finally(() => prisma.$disconnect());
