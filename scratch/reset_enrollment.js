const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Locating enrollment record DKE-2026-00002...");
  const reg = await prisma.course_registrations.findUnique({
    where: { enrollment_no: 'DKE-2026-00002' }
  });

  if (!reg) {
    console.log("Could not find enrollment record.");
    return;
  }
  console.log(`Found record: ${reg.full_name} (ID: ${reg.id})`);

  console.log("Deleting existing certificate records for this registration...");
  const deletedCerts = await prisma.certificates.deleteMany({
    where: { registration_id: reg.id }
  });
  console.log(`Deleted ${deletedCerts.count} certificate records.`);

  console.log("Resetting status to APPROVED...");
  const updatedReg = await prisma.course_registrations.update({
    where: { id: reg.id },
    data: { status: 'APPROVED' }
  });
  
  console.log(`Successfully updated status to: ${updatedReg.status}`);
}

main()
  .catch(e => console.error("Error running script:", e))
  .finally(() => prisma.$disconnect());
