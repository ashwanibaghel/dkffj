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

  console.log(`Checking registration and certificate for ${enrollmentNo}...`);

  const reg = await prisma.course_registrations.findUnique({
    where: { enrollment_no: enrollmentNo },
    include: {
      certificates: true
    }
  });

  if (!reg) {
    console.error("Registration not found!");
    return;
  }

  console.log("Registration:", {
    id: reg.id,
    full_name: reg.full_name,
    email: reg.email,
    status: reg.status,
    updated_at: reg.approved_at
  });

  console.log("Certificates:", reg.certificates.map(c => ({
    certificate_no: c.certificate_no,
    issue_date: c.issue_date,
    pdf_url: c.pdf_url,
    created_at: c.created_at
  })));

  // Let's also check the status logs for this registration
  const logs = await prisma.status_logs.findMany({
    where: { registration_id: reg.id },
    orderBy: { created_at: "desc" }
  });

  console.log("Status Logs:", logs.map(l => ({
    from_status: l.from_status,
    to_status: l.to_status,
    remarks: l.remarks,
    created_at: l.created_at
  })));
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
