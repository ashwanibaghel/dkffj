const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT routine_definition 
      FROM information_schema.routines 
      WHERE routine_name = 'create_auth_user';
    `;
    console.log("FUNCTION DEFINITION:\n", result[0]?.routine_definition);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
