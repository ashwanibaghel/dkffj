const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT crypt('TestPassword123!', gen_salt('bf', 10)) as hash;
    `);
    console.log("CRYPT RESULT:\n", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
