/**
 * PhonePe Payment Callback / Webhook Handler
 * PhonePe POSTs to this endpoint after payment completion (success or failure)
 * URL: POST /api/phonepe/callback
 *
 * PhonePe also redirects the user to /payment/success?orderId=XXX
 * This route handles server-side verification and DB update.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPhonePeOrder } from "@/lib/payment/phonepe";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { sendTransactionalEmail } from "@/services/email/service";
import {
  getMembershipReceiptTemplate,
  getCourseRegistrationReceiptTemplate,
} from "@/services/email/templates";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // PhonePe sends { merchantOrderId, orderId, state, ... } in callback body
    const merchantOrderId: string = body.merchantOrderId || body.orderId || "";

    if (!merchantOrderId) {
      return NextResponse.json({ error: "Missing merchantOrderId" }, { status: 400 });
    }

    await processPaymentCompletion(merchantOrderId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PhonePe callback error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

/** Also handle GET requests — PhonePe sometimes does a GET ping */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId") || "";
  if (orderId) await processPaymentCompletion(orderId);
  return NextResponse.json({ received: true });
}

/** Core logic: verify with PhonePe → update DB → send email */
export async function processPaymentCompletion(merchantOrderId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Verify with PhonePe
  const verifyResult = await verifyPhonePeOrder(merchantOrderId);
  if (!verifyResult.success) {
    console.warn(`PhonePe payment not completed for orderId: ${merchantOrderId}`, verifyResult);
    // Mark as failed in DB if exists
    await supabase
      .from("payments")
      .update({ status: "FAILED" })
      .eq("transaction_id", merchantOrderId);
    return;
  }

  // 2. Fetch payment record from DB
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, status, membership_id, registration_id, donation_id")
    .eq("transaction_id", merchantOrderId)
    .maybeSingle();

  if (!payment) {
    console.error("Payment record not found for orderId:", merchantOrderId);
    return;
  }

  if (payment.status === "COMPLETED") {
    console.log("Payment already processed:", merchantOrderId);
    return;
  }

  // 3. Mark payment as COMPLETED
  await supabase
    .from("payments")
    .update({
      status: "COMPLETED",
      gateway_transaction_id: verifyResult.transactionId,
    })
    .eq("id", payment.id);

  // 4. Handle linked entity

  // --- Membership ---
  if (payment.membership_id) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, ack_no, full_name, email, status")
      .eq("id", payment.membership_id)
      .single();

    if (membership) {
      await supabase
        .from("memberships")
        .update({ status: "UNDER_REVIEW" })
        .eq("id", membership.id);

      await supabase.from("status_logs").insert({
        membership_id: membership.id,
        from_status: membership.status,
        to_status: "UNDER_REVIEW",
        remarks: "Fee payment verified via PhonePe. Application forwarded to review board.",
      });

      const emailHtml = getMembershipReceiptTemplate(
        membership.full_name,
        membership.ack_no,
        Number(payment.amount)
      );
      await sendTransactionalEmail(
        membership.email,
        "Payment Verified & Membership Submitted - DKFFJ",
        emailHtml
      );
    }
    return;
  }

  // --- Donation ---
  if (payment.donation_id) {
    const donation = await prisma.donations.findUnique({
      where: { id: payment.donation_id },
    });

    if (donation) {
      await prisma.donations.update({
        where: { id: donation.id },
        data: {
          status: "COMPLETED",
          transaction_id: verifyResult.transactionId,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.vercel.app";
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #1565C0; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
          </div>
          <div style="padding: 24px; color: #334155;">
            <h2>Thank You for Your Generous Support!</h2>
            <p>Dear <strong>${donation.donor_name}</strong>,</p>
            <p>We have successfully received your donation of <strong>₹${donation.amount}</strong> towards <strong>${donation.purpose}</strong>.</p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">PhonePe Transaction ID:</span>
              <strong style="font-size: 14px; color: #15803d; display: block; margin-top: 5px; font-family: monospace;">${verifyResult.transactionId}</strong>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="${appUrl}/track?type=donation&id=${donation.order_id}" style="background-color: #1565C0; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Donation & Download Certificate</a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
          </div>
        </div>
      `;

      await sendTransactionalEmail(
        donation.donor_email,
        "Donation Successfully Received - Thank You! - DKFFJ",
        emailHtml
      );
    }
    return;
  }

  // --- Course Registration ---
  if (payment.registration_id) {
    const { data: registration } = await supabase
      .from("course_registrations")
      .select(`id, enrollment_no, full_name, email, status, courses (title)`)
      .eq("id", payment.registration_id)
      .single();

    if (registration) {
      await supabase
        .from("course_registrations")
        .update({ status: "APPROVED" })
        .eq("id", registration.id);

      await supabase.from("status_logs").insert({
        registration_id: registration.id,
        from_status: registration.status,
        to_status: "APPROVED",
        remarks: "Course fee payment verified via PhonePe. Enrollment approved.",
      });

      const courseTitle = (registration.courses as any)?.title || "Selected Course";
      const emailHtml = getCourseRegistrationReceiptTemplate(
        registration.full_name,
        courseTitle,
        registration.enrollment_no || "PENDING",
        Number(payment.amount)
      );
      await sendTransactionalEmail(
        registration.email,
        "Course Enrollment Successful - DKFFJ Academy",
        emailHtml
      );
    }
  }
}
