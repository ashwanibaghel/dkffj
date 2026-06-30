const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sql = `
    ALTER TABLE public.certificates 
    ADD COLUMN IF NOT EXISTS grade VARCHAR(100) DEFAULT 'A',
    ADD COLUMN IF NOT EXISTS performance VARCHAR(100) DEFAULT 'Excellent',
    ADD COLUMN IF NOT EXISTS venue VARCHAR(255) DEFAULT 'Online (DKFFJ Portal)',
    ADD COLUMN IF NOT EXISTS duration_from VARCHAR(100),
    ADD COLUMN IF NOT EXISTS duration_to VARCHAR(100);
  `;

  console.log("Adding grade, performance, venue, duration_from, duration_to columns to public.certificates table...");
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("Successfully added columns to public.certificates.");
  } catch (err) {
    console.error("Failed to add columns:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
