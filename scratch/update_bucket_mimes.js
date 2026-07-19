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
  console.log("Updating 'certificates' bucket allowed mime types...");

  try {
    // Update certificates bucket to support both PDF and PNG files
    await prisma.$executeRawUnsafe(`
      UPDATE storage.buckets
      SET allowed_mime_types = ARRAY['application/pdf', 'image/png']
      WHERE id = 'certificates';
    `);

    console.log("Successfully updated certificates bucket MIME types!");

    // Verify
    const buckets = await prisma.$queryRawUnsafe(`
      SELECT id, name, public, allowed_mime_types
      FROM storage.buckets
      WHERE id = 'certificates';
    `);
    console.log("Verification:", buckets);
  } catch (err) {
    console.error("Failed to update bucket allowed mime types:", err);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
