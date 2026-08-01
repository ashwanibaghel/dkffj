import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const apps = await prisma.appreciation_applications.findMany({
    select: {
      application_no: true,
      full_name: true,
      email: true,
      photo_url: true
    }
  });
  console.log("APP_COUNT:", apps.length);
  for (const a of apps) {
    console.log(`[${a.application_no}] ${a.full_name} (${a.email}) -> PHOTO: "${a.photo_url}"`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
