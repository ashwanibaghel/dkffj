const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, is_generated, generation_expression, column_default
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public';
    `;
    console.log("USERS COLUMNS:\n", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
