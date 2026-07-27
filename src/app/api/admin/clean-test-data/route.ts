import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
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

    const keepCertIds = ashwiniCerts.map((c) => c.id);
    const keepRegistrationIds = ashwiniCerts.map((c) => c.registration_id);

    const deletedCerts = await prisma.certificates.deleteMany({
      where: {
        id: { notIn: keepCertIds }
      }
    });

    // 2. Clean Course Registrations / Enrollments (Keep Ashwini Saurabh)
    const deletedCourseRegs = await prisma.course_registrations.deleteMany({
      where: {
        id: { notIn: keepRegistrationIds }
      }
    });

    const deletedEnrollments = await prisma.enrollment.deleteMany({});

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

    // 4. Clean Payments
    const deletedPayments = await prisma.payments.deleteMany({});

    // 5. Clean Donations
    const deletedDonations = await prisma.donations.deleteMany({});

    // 6. Clean Appreciation Applications
    const deletedAppreciations = await prisma.appreciation_applications.deleteMany({});

    // 7. Clean Grievance Desk (Complaints)
    const deletedAttachments = await prisma.complaint_attachments.deleteMany({});
    const deletedComplaints = await prisma.complaints.deleteMany({});
    const deletedSimpleComplaints = await prisma.complaint.deleteMany({});

    const report = {
      success: true,
      deletedCerts: deletedCerts.count,
      keptAshwiniCerts: keepCertIds.length,
      deletedCourseRegs: deletedCourseRegs.count,
      deletedEnrollments: deletedEnrollments.count,
      deletedTestMemberships: deletedMemberships.count,
      deletedPayments: deletedPayments.count,
      deletedDonations: deletedDonations.count,
      deletedAppreciations: deletedAppreciations.count,
      deletedComplaints: deletedComplaints.count + deletedSimpleComplaints.count,
      deletedAttachments: deletedAttachments.count
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Cleanup Route Error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
