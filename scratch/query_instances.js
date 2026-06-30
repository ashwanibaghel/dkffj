const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const instances = await prisma.$queryRawUnsafe(`
      SELECT * FROM auth.instances;
    `);
    console.log("INSTANCES:\n", JSON.stringify(instances, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
