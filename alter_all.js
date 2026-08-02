const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Executing DB ALTER TABLE queries...');

  const queries = [
    'ALTER TABLE appreciation_applications ALTER COLUMN user_id DROP NOT NULL;',
    'ALTER TABLE appreciation_applications DROP CONSTRAINT IF EXISTS appreciation_applications_user_id_fkey;',
    'ALTER TABLE memberships ALTER COLUMN user_id DROP NOT NULL;',
    'ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;',
    'ALTER TABLE course_registrations ALTER COLUMN user_id DROP NOT NULL;',
    'ALTER TABLE course_registrations DROP CONSTRAINT IF EXISTS course_registrations_user_id_fkey;',
    'ALTER TABLE complaints ALTER COLUMN user_id DROP NOT NULL;',
    'ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_user_id_fkey;',
    'ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;',
    'ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;',
    'ALTER TABLE status_logs ALTER COLUMN user_id DROP NOT NULL;',
    'ALTER TABLE status_logs DROP CONSTRAINT IF EXISTS status_logs_user_id_fkey;'
  ];

  for (const q of queries) {
    try {
      await prisma.$executeRawUnsafe(q);
      console.log('OK:', q);
    } catch (e) {
      console.log('ERR (' + q + '):', e.message);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
