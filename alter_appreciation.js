const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding referred_by_member_id column to appreciation_applications table...');
  await prisma.$executeRawUnsafe('ALTER TABLE appreciation_applications ADD COLUMN IF NOT EXISTS referred_by_member_id UUID DEFAULT NULL;');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_appreciation_referred_by ON appreciation_applications(referred_by_member_id);');
  console.log('Done: referred_by_member_id column created successfully in appreciation_applications!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
