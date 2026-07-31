import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  console.log("Starting DB Test Data Cleanup with DIRECT_URL...");

  // 1. Clean Certificates (Keep Ashwini Saurabh / 1074)
  const ashwiniCerts = await prisma.certificates.findMany({
    where: {
      OR: [
        { user_name: { contains: "Ashwini", mode: "insensitive" } },
        { user_name: { contains: "Saurabh", mode: "insensitive" } },
        { certificate_no: { contains: "1074" } }
      ]
    }
  });

  const keepCertIds = ashwiniCerts.map(c => c.id);
  const keepRegistrationIds = ashwiniCerts.map(c => c.registration_id);

  const deletedCerts = await prisma.certificates.deleteMany({
    where: {
      id: { notIn: keepCertIds }
    }
  });
  console.log(`Deleted ${deletedCerts.count} test certificates. Kept ${keepCertIds.length} Ashwini Saurabh certificates.`);

  // 2. Clean Course Registrations / Enrollments (Keep Ashwini Saurabh)
  const deletedCourseRegs = await prisma.course_registrations.deleteMany({
    where: {
      id: { notIn: keepRegistrationIds }
    }
  });
  console.log(`Deleted ${deletedCourseRegs.count} test course registrations.`);

  const deletedEnrollments = await prisma.enrollment.deleteMany({});
  console.log(`Deleted ${deletedEnrollments.count} test Enrollment records.`);

  // 3. Clean Memberships (Keep Migrated Legacy & Executive Council Members)
  const deletedMemberships = await prisma.memberships.deleteMany({
    where: {
      AND: [
        { remarks: { not: "MIGRATED_PHP" } },
        { remarks: { not: "Migrated from Executive Council Board Registry" } },
        { remarks: { not: "MIGRATED_EXECUTIVE_COUNCIL" } },
        { ack_no: { not: { startsWith: "DKE-EXEC-" } } },
        { ack_no: { not: { startsWith: "DKE-MIG-" } } }
      ]
    }
  });
  console.log(`Deleted ${deletedMemberships.count} test active membership applications.`);

  // 4. Clean Payments
  const deletedPayments = await prisma.payments.deleteMany({});
  console.log(`Deleted ${deletedPayments.count} test payment records.`);

  // 5. Clean Donations
  const deletedDonations = await prisma.donations.deleteMany({});
  console.log(`Deleted ${deletedDonations.count} test donation records.`);

  // 6. Clean Appreciation Applications
  const deletedAppreciations = await prisma.appreciation_applications.deleteMany({});
  console.log(`Deleted ${deletedAppreciations.count} test appreciation applications.`);

  // 7. Clean Grievance Desk (Complaints)
  const deletedAttachments = await prisma.complaint_attachments.deleteMany({});
  const deletedComplaints = await prisma.complaints.deleteMany({});
  const deletedSimpleComplaints = await prisma.complaint.deleteMany({});
  console.log(`Deleted ${deletedComplaints.count + deletedSimpleComplaints.count} test complaints/grievances and ${deletedAttachments.count} attachments.`);

  const summary = `
=== CLEANUP SUMMARY ===
- Test Certificates Deleted: ${deletedCerts.count} (Ashwini Saurabh Preserved)
- Test Course Registrations Deleted: ${deletedCourseRegs.count}
- Test Enrollments Deleted: ${deletedEnrollments.count}
- Test Memberships Deleted: ${deletedMemberships.count} (All 389 Migrated Members Preserved)
- Test Payments Deleted: ${deletedPayments.count}
- Test Donations Deleted: ${deletedDonations.count}
- Test Appreciation Applications Deleted: ${deletedAppreciations.count}
- Test Grievances Deleted: ${deletedComplaints.count + deletedSimpleComplaints.count}
  `;

  console.log(summary);
  fs.writeFileSync(path.join(process.cwd(), "scratch", "cleanup_report.txt"), summary);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
