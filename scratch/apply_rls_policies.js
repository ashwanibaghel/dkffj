const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: ".env" });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  console.log("Applying Storage RLS policies for 'certificates' bucket...");

  const sql1 = `
    DROP POLICY IF EXISTS "certificates_upload_policy" ON storage.objects;
  `;
  const sql2 = `
    CREATE POLICY "certificates_upload_policy"
      ON storage.objects
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'certificates');
  `;
  const sql3 = `
    DROP POLICY IF EXISTS "certificates_update_policy" ON storage.objects;
  `;
  const sql4 = `
    CREATE POLICY "certificates_update_policy"
      ON storage.objects
      FOR UPDATE
      TO anon, authenticated
      USING (bucket_id = 'certificates')
      WITH CHECK (bucket_id = 'certificates');
  `;
  const sql5 = `
    DROP POLICY IF EXISTS "certificates_read_policy" ON storage.objects;
  `;
  const sql6 = `
    CREATE POLICY "certificates_read_policy"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'certificates');
  `;

  try {
    await prisma.$executeRawUnsafe(sql1);
    await prisma.$executeRawUnsafe(sql2);
    console.log("Upload policy applied successfully!");

    await prisma.$executeRawUnsafe(sql3);
    await prisma.$executeRawUnsafe(sql4);
    console.log("Update/Overwrite policy applied successfully!");

    await prisma.$executeRawUnsafe(sql5);
    await prisma.$executeRawUnsafe(sql6);
    console.log("Read policy applied successfully!");

    console.log("All policies applied successfully!");
  } catch (err) {
    console.error("Failed to apply RLS policies:", err);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
