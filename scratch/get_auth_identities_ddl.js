const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, is_generated, generation_expression, column_default
      FROM information_schema.columns
      WHERE table_name = 'identities' AND table_schema = 'auth';
    `;
    console.log("AUTH.IDENTITIES COLUMNS:\n", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
