const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const policies = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'objects' OR tablename = 'buckets';
    `);
    console.log("POLICIES:\n", JSON.stringify(policies, null, 2));

    const buckets = await prisma.$queryRawUnsafe(`
      SELECT id, name, public FROM storage.buckets;
    `);
    console.log("BUCKETS:\n", JSON.stringify(buckets, null, 2));
  } catch (err) {
    console.error("Error running query:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
