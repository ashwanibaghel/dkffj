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
  console.log("Fetching storage buckets info...");

  try {
    const buckets = await prisma.$queryRawUnsafe(`
      SELECT id, name, public, allowed_mime_types, file_size_limit
      FROM storage.buckets;
    `);
    console.log(buckets);
  } catch (err) {
    console.error("Failed to query buckets:", err);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
