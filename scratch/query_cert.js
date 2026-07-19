const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certificates.findMany({
    include: {
      course_registrations: true
    },
    orderBy: {
      created_at: "desc"
    },
    take: 5
  });

  console.log("Recent Certificates:");
  for (const c of certs) {
    console.log({
      id: c.id,
      certificate_no: c.certificate_no,
      user_name: c.user_name,
      course_name: c.course_name,
      pdf_url: c.pdf_url,
      qr_code_url: c.qr_code_url,
      registration_status: c.course_registrations.status,
      registration_id: c.registration_id
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
