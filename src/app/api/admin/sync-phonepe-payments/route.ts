import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { verifyPhonePeOrder } from "@/lib/payment/phonepe";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipReceiptTemplate, getCourseRegistrationReceiptTemplate, getAppreciationReceiptTemplate } from "@/services/email/templates";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleSync();
}

export async function POST(req: NextRequest) {
  return handleSync();
}

async function handleSync() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Fetch all pending payments from DB
    const { data: pendingPayments, error: fetchErr } = await supabase
      .from("payments")
      .select("id, transaction_id, amount, status, created_at, membership_id, registration_id, donation_id, appreciation_id")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    if (fetchErr || !pendingPayments) {
      return NextResponse.json({ success: false, error: fetchErr?.message || "Failed to fetch pending payments" }, { status: 500 });
    }

    console.log(`[PHONEPE SYNC] Found ${pendingPayments.length} pending payments to check against PhonePe.`);

    const syncedResults: Array<{ transactionId: string; amount: number; type: string; status: string; customerName?: string }> = [];

    for (const payment of pendingPayments) {
      try {
        const verifyRes = await verifyPhonePeOrder(payment.transaction_id);

        if (verifyRes.success || verifyRes.state === "PAYMENT_SUCCESS" || verifyRes.state === "COMPLETED") {
          console.log(`[PHONEPE SYNC SUCCESS] Payment ${payment.transaction_id} is COMPLETED on PhonePe! Updating DB...`);

          // Update payment status in DB
          await supabase
            .from("payments")
            .update({
              status: "COMPLETED",
              gateway_transaction_id: verifyRes.transactionId || payment.transaction_id
            })
            .eq("id", payment.id);

          let paymentType = "unknown";
          let customerName = "Applicant";

          // Process linked Membership
          if (payment.membership_id) {
            paymentType = "membership";
            const { data: mem } = await supabase
              .from("memberships")
              .select("id, full_name, email, ack_no, father_name, mobile, status")
              .eq("id", payment.membership_id)
              .maybeSingle();

            if (mem) {
              customerName = mem.full_name;
              await supabase.from("memberships").update({ status: "UNDER_REVIEW" }).eq("id", mem.id);
              await supabase.from("status_logs").insert({
                membership_id: mem.id,
                from_status: mem.status || "PENDING",
                to_status: "UNDER_REVIEW",
                remarks: "Fee payment reconciled & verified via PhonePe Sync. Application moved to review."
              });

              try {
                const emailHtml = getMembershipReceiptTemplate(mem.full_name, mem.ack_no, Number(payment.amount));
                await sendTransactionalEmail(mem.email, "Payment Verified & Membership Submitted - DKFFJ", emailHtml);
              } catch (e) {
                console.error("Email error:", e);
              }
            }
          }

          // Process linked Appreciation
          if (payment.appreciation_id) {
            paymentType = "appreciation";
            const { data: app } = await supabase
              .from("appreciation_applications")
              .select("id, full_name, email, application_no, mobile, status")
              .eq("id", payment.appreciation_id)
              .maybeSingle();

            if (app) {
              customerName = app.full_name;
              await supabase.from("appreciation_applications").update({ status: "UNDER_REVIEW" }).eq("id", app.id);
              await supabase.from("status_logs").insert({
                appreciation_id: app.id,
                from_status: app.status || "PENDING",
                to_status: "UNDER_REVIEW",
                remarks: "Appreciation fee reconciled & verified via PhonePe Sync. Forwarded to review board."
              });

              try {
                const emailHtml = getAppreciationReceiptTemplate(app.full_name, app.application_no, Number(payment.amount));
                await sendTransactionalEmail(app.email, "Payment Verified & Appreciation Application Submitted - DKFFJ", emailHtml);
              } catch (e) {
                console.error("Email error:", e);
              }
            }
          }

          // Process linked Course Registration
          if (payment.registration_id) {
            paymentType = "course_registration";
            const { data: reg } = await supabase
              .from("course_registrations")
              .select("id, full_name, email, enrollment_no, status, courses(title)")
              .eq("id", payment.registration_id)
              .maybeSingle();

            if (reg) {
              customerName = reg.full_name;
              await supabase.from("course_registrations").update({ status: "APPROVED" }).eq("id", reg.id);
              await supabase.from("status_logs").insert({
                registration_id: reg.id,
                from_status: reg.status || "PENDING",
                to_status: "APPROVED",
                remarks: "Course fee reconciled & verified via PhonePe Sync. Enrollment approved."
              });

              try {
                const courseTitle = (reg.courses as any)?.title || "Selected Course";
                const emailHtml = getCourseRegistrationReceiptTemplate(reg.full_name, courseTitle, reg.enrollment_no || "PENDING", Number(payment.amount));
                await sendTransactionalEmail(reg.email, "Course Enrollment Approved - DKFFJ Academy", emailHtml);
              } catch (e) {
                console.error("Email error:", e);
              }
            }
          }

          // Process linked Donation
          if (payment.donation_id) {
            paymentType = "donation";
            const donation = await prisma.donations.findUnique({ where: { id: payment.donation_id } });
            if (donation) {
              customerName = donation.donor_name;
              await prisma.donations.update({
                where: { id: donation.id },
                data: { status: "COMPLETED", transaction_id: verifyRes.transactionId || payment.transaction_id }
              });
            }
          }

          syncedResults.push({
            transactionId: payment.transaction_id,
            amount: Number(payment.amount),
            type: paymentType,
            status: "COMPLETED",
            customerName
          });
        }
      } catch (itemErr: any) {
        console.error(`[PHONEPE SYNC ERROR] Error checking order ${payment.transaction_id}:`, itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      totalChecked: pendingPayments.length,
      syncedCount: syncedResults.length,
      syncedPayments: syncedResults
    });
  } catch (err: any) {
    console.error("PhonePe sync route exception:", err);
    return NextResponse.json({ success: false, error: err?.message || "Sync execution failed" }, { status: 500 });
  }
}
