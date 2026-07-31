import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const allPayments = await prisma.payments.findMany({
      include: {
        memberships: true,
        appreciation_applications: true,
        course_registrations: true,
        donations: true
      }
    });

    const ashwaniPaymentIds: string[] = [];
    const matchedRecords: any[] = [];
    const debugAll: any[] = [];

    for (const p of allPayments) {
      const name = (
        p.memberships?.full_name ||
        p.appreciation_applications?.full_name ||
        p.course_registrations?.full_name ||
        p.donations?.donor_name ||
        ""
      );

      const email = (
        p.memberships?.email ||
        p.appreciation_applications?.email ||
        p.course_registrations?.email ||
        p.donations?.donor_email ||
        ""
      );

      const mobile = (
        p.memberships?.mobile ||
        p.appreciation_applications?.mobile ||
        p.course_registrations?.mobile ||
        p.donations?.donor_mobile ||
        ""
      );

      debugAll.push({
        id: p.id,
        tx: p.transaction_id,
        amount: p.amount,
        status: p.status,
        name,
        email,
        mobile
      });

      const lowerName = name.toLowerCase();
      const lowerEmail = email.toLowerCase();

      if (
        lowerName.includes("ashwani") ||
        lowerName.includes("baghel") ||
        lowerEmail.includes("ashwani") ||
        mobile.includes("9027872803") ||
        mobile.includes("873894")
      ) {
        ashwaniPaymentIds.push(p.id);
        matchedRecords.push({ id: p.id, name, amount: p.amount, tx: p.transaction_id });
      }
    }

    if (ashwaniPaymentIds.length > 0) {
      await prisma.payments.deleteMany({
        where: {
          id: { in: ashwaniPaymentIds }
        }
      });
    }

    return NextResponse.json({
      success: true,
      deletedCount: ashwaniPaymentIds.length,
      deletedRecords: matchedRecords,
      debugAll
    });
  } catch (err: any) {
    console.error("Purge error:", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
