const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Academy Certificates (from certificates table)
    const academyCertificatesCount = await prisma.certificates.count();
    const academyCertificates = await prisma.certificates.findMany({
      select: {
        certificate_no: true,
        user_name: true,
        course_name: true,
        issue_date: true
      }
    });

    // 2. Approved Memberships (Membership Certificates)
    const approvedMembersCount = await prisma.memberships.count({
      where: { status: "APPROVED" }
    });
    const approvedMembers = await prisma.memberships.findMany({
      where: { status: "APPROVED" },
      select: {
        membership_no: true,
        full_name: true,
        approved_at: true
      }
    });

    // 3. Approved Social Work Appreciation Applications (Appreciation Certificates)
    // Note: status is a String, check values case-insensitively
    const allAppreciations = await prisma.appreciation_applications.findMany({
      select: {
        application_no: true,
        full_name: true,
        status: true,
        approved_at: true
      }
    });

    const approvedAppreciations = allAppreciations.filter(app => app.status.toUpperCase() === "APPROVED");
    const approvedAppreciationsCount = approvedAppreciations.length;

    console.log("--- CERTIFICATES STATISTICS ---");
    console.log(`1. Academy Course Completion Certificates: ${academyCertificatesCount}`);
    academyCertificates.forEach(c => {
      console.log(`   - No: ${c.certificate_no} | Name: ${c.user_name} | Course: ${c.course_name} | Date: ${c.issue_date}`);
    });

    console.log(`\n2. Membership Certificates (Approved Members): ${approvedMembersCount}`);
    approvedMembers.forEach(m => {
      console.log(`   - No: ${m.membership_no} | Name: ${m.full_name} | Date: ${m.approved_at}`);
    });

    console.log(`\n3. Appreciation Certificates (Approved Social Work): ${approvedAppreciationsCount}`);
    approvedAppreciations.forEach(a => {
      console.log(`   - AppNo: ${a.application_no} | Name: ${a.full_name} | Date: ${a.approved_at}`);
    });

    console.log(`\nTotal Certificates: ${academyCertificatesCount + approvedMembersCount + approvedAppreciationsCount}`);

  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
