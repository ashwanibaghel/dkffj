const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const course = await prisma.courses.findFirst({
      where: { title: "Certificate in Computer Applications (CCA)" }
    });
    console.log("CCA Course details:", JSON.stringify(course, null, 2));

    const courseADCA = await prisma.courses.findFirst({
      where: { title: "Advanced Certificate in Computer Applications (ACCA)" }
    });
    console.log("ACCA Course details:", JSON.stringify(courseADCA, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
