const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Prisma models available:", Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
  
  // Try to find by the camelCase or matching model name
  const modelName = Object.keys(prisma).find(k => k.toLowerCase() === 'courseregistrations' || k.toLowerCase() === 'course_registrations');
  if (modelName) {
    const reg = await prisma[modelName].findFirst({
      where: { enrollment_no: 'DKE-2026-00002' },
      include: {
        certificates: true
      }
    });
    console.log("Registration Record:", JSON.stringify(reg, null, 2));
  } else {
    console.log("Could not find course_registrations model name.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
