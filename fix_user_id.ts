import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Running ALTER TABLE appreciation_applications ALTER COLUMN user_id DROP NOT NULL...");
    await prisma.$executeRawUnsafe(
      ALTER TABLE "appreciation_applications" ALTER COLUMN "user_id" DROP NOT NULL;
    );
    console.log("SUCCESSFULLY DROPPED NOT NULL CONSTRAINT ON user_id IN appreciation_applications!");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
