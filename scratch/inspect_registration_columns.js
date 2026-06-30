const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const regColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'course_registrations';
    `);
    console.log("COURSE REGISTRATIONS COLUMNS:\n", JSON.stringify(regColumns, null, 2));

    const certColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'certificates';
    `);
    console.log("CERTIFICATES COLUMNS:\n", JSON.stringify(certColumns, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
