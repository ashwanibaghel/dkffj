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
  const enrollmentNo = "DKE-2026-00019";

  console.log(`Starting direct reset for ${enrollmentNo}...`);

  // 1. Find course registration
  const reg = await prisma.course_registrations.findUnique({
    where: { enrollment_no: enrollmentNo }
  });

  if (!reg) {
    console.error(`Course registration not found for ${enrollmentNo}`);
    return;
  }

  console.log(`Found registration ID: ${reg.id}. Current status: ${reg.status}`);

  // 2. Delete certificates
  const deletedCerts = await prisma.certificates.deleteMany({
    where: { registration_id: reg.id }
  });
  console.log(`Deleted ${deletedCerts.count} certificate record(s) matching registration ID.`);

  // 3. Reset status
  const updatedReg = await prisma.course_registrations.update({
    where: { id: reg.id },
    data: {
      status: "PENDING"
    }
  });

  console.log(`Successfully reset registration status to: ${updatedReg.status}`);
}

main()
  .catch((e) => {
    console.error("Error during reset:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
