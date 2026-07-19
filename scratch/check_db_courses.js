const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.courses.count();
    console.log(`Total courses in database: ${count}`);
    
    const sample = await prisma.courses.findMany({ take: 5 });
    console.log("Sample courses in database:", JSON.stringify(sample, null, 2));

    // Check if there is an api endpoint or page to manage courses
  } catch (err) {
    console.error("Error checking courses in DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
