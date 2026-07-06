import { NextRequest, NextResponse } from "next/server";
import { verifyPhonePeOrder } from "@/lib/payment/phonepe";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { sendTransactionalEmail } from "@/services/email/service";
import {
  getMembershipReceiptTemplate,
  getCourseRegistrationReceiptTemplate,
} from "@/services/email/templates";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // First check our DB — if already COMPLETED, return immediately
    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount, status, membership_id, registration_id, donation_id")
      .eq("transaction_id", orderId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment record not found" }, { status: 404 });
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.json({ success: true, status: "COMPLETED", orderId });
    }

    // Determine if it is a bypass payment by checking the email of the linked entity
    let isBypass = false;
    let customerEmail = "";
    let customerName = "";
    let ackOrEnrollmentNo = "";
    let courseTitle = "";

    if (payment.membership_id) {
      const { data: membership } = await supabase
        .from("memberships")
        .select("email, full_name, ack_no")
        .eq("id", payment.membership_id)
        .maybeSingle();
      if (membership) {
        customerEmail = membership.email;
        customerName = membership.full_name;
        ackOrEnrollmentNo = membership.ack_no;
        if (membership.email.toLowerCase().includes("bypass")) {
          isBypass = true;
        }
      }
    } else if (payment.registration_id) {
      const { data: registration } = await supabase
        .from("course_registrations")
        .select(`email, full_name, enrollment_no, courses (title)`)
        .eq("id", payment.registration_id)
        .maybeSingle();
      if (registration) {
        customerEmail = registration.email;
        customerName = registration.full_name;
        ackOrEnrollmentNo = registration.enrollment_no || "PENDING";
        courseTitle = (registration.courses as any)?.title || "Selected Course";
        if (registration.email.toLowerCase().includes("bypass")) {
          isBypass = true;
        }
      }
    } else if (payment.donation_id) {
      const { PrismaClient } = await import("@prisma/client");
      const prismaLocal = new PrismaClient();
      const donation = await prismaLocal.donations.findUnique({
        where: { id: payment.donation_id }
      });
      if (donation) {
        customerEmail = donation.donor_email;
        customerName = donation.donor_name;
        if (donation.donor_email.toLowerCase().includes("bypass")) {
          isBypass = true;
        }
      }
    }

    if (isBypass) {
      console.log(`[PAYMENT BYPASS] Bypassing payment for orderId: ${orderId}, Email: ${customerEmail}`);
      const mockTxnId = "BYPASS-" + orderId;

      // 1. Mark payment as COMPLETED
      await supabase
        .from("payments")
        .update({
          status: "COMPLETED",
          gateway_transaction_id: mockTxnId,
        })
        .eq("id", payment.id);

      // 2. Handle linked entities
      if (payment.membership_id) {
        await supabase
          .from("memberships")
          .update({ status: "UNDER_REVIEW" })
          .eq("id", payment.membership_id);

        await supabase.from("status_logs").insert({
          membership_id: payment.membership_id,
          from_status: "PENDING",
          to_status: "UNDER_REVIEW",
          remarks: "Fee payment bypassed for testing. Application forwarded to review board.",
        });

        const emailHtml = getMembershipReceiptTemplate(
          customerName,
          ackOrEnrollmentNo,
          Number(payment.amount)
        );
        await sendTransactionalEmail(
          customerEmail,
          "Payment Verified & Membership Submitted (Bypass Mode) - DKFFJ",
          emailHtml
        );
      } else if (payment.donation_id) {
        const { PrismaClient } = await import("@prisma/client");
        const prismaLocal = new PrismaClient();
        await prismaLocal.donations.update({
          where: { id: payment.donation_id },
          data: {
            status: "COMPLETED",
            transaction_id: mockTxnId,
          },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.vercel.app";
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1565C0; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
            </div>
            <div style="padding: 24px; color: #334155;">
              <h2>Thank You for Your Generous Support! (Bypass Mode)</h2>
              <p>Dear <strong>${customerName}</strong>,</p>
              <p>We have successfully received your donation of <strong>₹${payment.amount}</strong>.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">Mock Transaction ID:</span>
                <strong style="font-size: 14px; color: #15803d; display: block; margin-top: 5px; font-family: monospace;">${mockTxnId}</strong>
              </div>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${appUrl}/track?type=donation&id=${orderId}" style="background-color: #1565C0; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Donation & Download Certificate</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
            </div>
          </div>
        `;

        await sendTransactionalEmail(
          customerEmail,
          "Donation Successfully Received (Bypass Mode) - Thank You! - DKFFJ",
          emailHtml
        );
      } else if (payment.registration_id) {
        await supabase
          .from("course_registrations")
          .update({ status: "APPROVED" })
          .eq("id", payment.registration_id);

        await supabase.from("status_logs").insert({
          registration_id: payment.registration_id,
          from_status: "PENDING",
          to_status: "APPROVED",
          remarks: "Course fee payment bypassed for testing. Enrollment approved.",
        });

        const emailHtml = getCourseRegistrationReceiptTemplate(
          customerName,
          courseTitle,
          ackOrEnrollmentNo,
          Number(payment.amount)
        );
        await sendTransactionalEmail(
          customerEmail,
          "Course Enrollment Successful (Bypass Mode) - DKFFJ Academy",
          emailHtml
        );
      }

      return NextResponse.json({ success: true, status: "COMPLETED", orderId });
    }

    // Otherwise verify with PhonePe directly
    const result = await verifyPhonePeOrder(orderId);

    // If PhonePe says completed but our DB isn't updated yet, trigger update
    if (result.success && payment && payment.status !== "COMPLETED") {
      const { processPaymentCompletion } = await import("../callback/route");
      await processPaymentCompletion(orderId);
    }

    return NextResponse.json({
      success: result.success,
      status: result.state,
      transactionId: result.transactionId,
      orderId,
    });
  } catch (err: any) {
    console.error("PhonePe verify error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
