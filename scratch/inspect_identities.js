const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'identities';
    `);
    console.log("IDENTITIES COLUMNS:\n", JSON.stringify(columns, null, 2));

    const samples = await prisma.$queryRawUnsafe(`
      SELECT * FROM auth.identities LIMIT 2;
    `);
    console.log("IDENTITIES SAMPLES:\n", JSON.stringify(samples, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
