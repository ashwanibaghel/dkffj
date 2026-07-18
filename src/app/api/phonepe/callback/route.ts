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
import prisma from "@/lib/prisma";
import { createHmac } from "crypto";

/** Verify HMAC signature from PhonePe webhook */
function verifyWebhookSignature(rawBody: string, authHeader: string | null): boolean {
  const secret = process.env.PHONEPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("PHONEPE_WEBHOOK_SECRET not set — skipping verification");
    return true; // allow in dev if secret not configured
  }
  if (!authHeader) {
    console.warn("No Authorization header from PhonePe webhook");
    return false;
  }
  // PhonePe sends: Authorization: <hmac-sha256-hex>
  const expectedSig = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return authHeader === expectedSig;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    // Verify this request is genuinely from PhonePe
    const authHeader = req.headers.get("authorization") || req.headers.get("x-verify");
    if (!verifyWebhookSignature(rawBody, authHeader)) {
      console.error("PhonePe webhook signature mismatch — rejected");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody || "{}");

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
    .select("id, amount, status, membership_id, registration_id, donation_id, appreciation_id")
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

  // 3. Mark payment as COMPLETED (optimistic concurrency lock)
  const { data: updatedPayment } = await supabase
    .from("payments")
    .update({
      status: "COMPLETED",
      gateway_transaction_id: verifyResult.transactionId,
    })
    .eq("id", payment.id)
    .eq("status", "PENDING")
    .select("id");

  if (!updatedPayment || updatedPayment.length === 0) {
    console.log("[PHONEPE CALLBACK] Payment already completed by another thread/process:", merchantOrderId);
    return;
  }

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

      let attachments: any[] = [];
      try {
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
        const pdfBuffer = await generateReceiptPdfBuffer({
          refId: merchantOrderId,
          date: payment.created_at,
          ackOrEnrollmentNo: membership.ack_no,
          gatewayTransactionId: verifyResult.transactionId || "PENDING",
          amount: Number(payment.amount),
          description: "NGO Membership Fee",
          customerName: membership.full_name,
          fatherName: membership.father_name,
          customerMobile: membership.mobile,
          customerEmail: membership.email
        });
        attachments.push({ filename: `Receipt_${merchantOrderId}.pdf`, content: pdfBuffer });
      } catch (pdfErr) {
        console.error("Failed to generate PDF receipt attachment for membership:", pdfErr);
      }

      await sendTransactionalEmail(
        membership.email,
        "Payment Verified & Membership Submitted - DKFFJ",
        emailHtml,
        attachments
      );

      // Notify Admins
      try {
        const { data: admins } = await supabase
          .from("users")
          .select("email")
          .in("role", ["ADMIN", "SUPERADMIN"]);
        const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
        const adminRecipients = adminEmails.length > 0 ? adminEmails : [process.env.ADMIN_NOTIFICATION_EMAIL || "info@dkffj.org"];
        const adminSubject = `New Membership Fee Paid (Awaiting Review) - ${membership.full_name}`;
        const adminHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
            <div style="padding: 24px; color: #334155;">
              <h2>New Membership Application Paid & Awaiting Review</h2>
              <p>Hello Admin,</p>
              <p>A new membership application fee of <strong>INR ${payment.amount}</strong> has been verified for candidate: <strong>${membership.full_name}</strong>.</p>
              <p><strong>Acknowledgement Number:</strong> ${membership.ack_no}</p>
              <p>Please review the applicant's profile and documents from the admin dashboard to proceed with membership approval and ID card generation.</p>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/admin/members" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
              </div>
            </div>
          </div>
        `;
        for (const adminEmail of adminRecipients) {
          await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
        }
      } catch (adminErr) {
        console.error("Admin notification error (membership):", adminErr);
      }
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

      let attachments: any[] = [];
      try {
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
        const pdfBuffer = await generateReceiptPdfBuffer({
          refId: merchantOrderId,
          date: payment.created_at,
          ackOrEnrollmentNo: registration.enrollment_no || "PENDING",
          gatewayTransactionId: verifyResult.transactionId || "PENDING",
          amount: Number(payment.amount),
          description: courseTitle,
          customerName: registration.full_name,
          fatherName: registration.father_name,
          customerMobile: registration.mobile,
          customerEmail: registration.email
        });
        attachments.push({ filename: `Receipt_${merchantOrderId}.pdf`, content: pdfBuffer });
      } catch (pdfErr) {
        console.error("Failed to generate PDF receipt attachment for course registration:", pdfErr);
      }

      await sendTransactionalEmail(
        registration.email,
        "Course Enrollment Successful - DKFFJ Academy",
        emailHtml,
        attachments
      );

      // Notify Admins
      try {
        const { data: admins } = await supabase
          .from("users")
          .select("email")
          .in("role", ["ADMIN", "SUPERADMIN"]);
        const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
        const adminRecipients = adminEmails.length > 0 ? adminEmails : [process.env.ADMIN_NOTIFICATION_EMAIL || "info@dkffj.org"];
        const adminSubject = `New Course Enrollment Verified - ${registration.full_name}`;
        const adminHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
            <div style="padding: 24px; color: #334155;">
              <h2>New Student Enrollment Confirmed</h2>
              <p>Hello Admin,</p>
              <p>A new student enrollment fee of <strong>INR ${payment.amount}</strong> has been verified for: <strong>${registration.full_name}</strong> for the course: <strong>${courseTitle}</strong>.</p>
              <p><strong>Enrollment Number:</strong> ${registration.enrollment_no}</p>
              <p>The student's enrollment has been approved. Please manage this registration from the academy admin panel.</p>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/admin/registrations" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
              </div>
            </div>
          </div>
        `;
        for (const adminEmail of adminRecipients) {
          await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
        }
      } catch (adminErr) {
        console.error("Admin notification error (course):", adminErr);
      }
    }
  }

  // --- Appreciation Application ---
  if (payment.appreciation_id) {
    const { data: app } = await supabase
      .from("appreciation_applications")
      .select("id, application_no, full_name, email, status")
      .eq("id", payment.appreciation_id)
      .single();

    if (app) {
      await supabase
        .from("appreciation_applications")
        .update({ status: "UNDER_REVIEW" })
        .eq("id", app.id);

      await supabase.from("status_logs").insert({
        appreciation_id: app.id,
        from_status: app.status,
        to_status: "UNDER_REVIEW",
        remarks: "Appreciation fee payment verified via PhonePe. Forwarded to board review.",
      });

      const { getAppreciationReceiptTemplate } = await import("@/services/email/templates");
      const emailHtml = getAppreciationReceiptTemplate(
        app.full_name,
        app.application_no,
        Number(payment.amount)
      );

      let attachments: any[] = [];
      try {
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
        const pdfBuffer = await generateReceiptPdfBuffer({
          refId: merchantOrderId,
          date: payment.created_at,
          ackOrEnrollmentNo: app.application_no,
          gatewayTransactionId: verifyResult.transactionId || "PENDING",
          amount: Number(payment.amount),
          description: "Appreciation Application Fee",
          customerName: app.full_name,
          fatherName: "N/A",
          customerMobile: app.mobile,
          customerEmail: app.email
        });
        attachments.push({ filename: `Receipt_${merchantOrderId}.pdf`, content: pdfBuffer });
      } catch (pdfErr) {
        console.error("Failed to generate PDF receipt attachment for appreciation:", pdfErr);
      }

      await sendTransactionalEmail(
        app.email,
        "Payment Verified & Appreciation Application Submitted - DKFFJ",
        emailHtml,
        attachments
      );

      // Notify Admins
      try {
        const { data: admins } = await supabase
          .from("users")
          .select("email")
          .in("role", ["ADMIN", "SUPERADMIN"]);
        const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
        const adminRecipients = adminEmails.length > 0 ? adminEmails : [process.env.ADMIN_NOTIFICATION_EMAIL || "info@dkffj.org"];
        const adminSubject = `New Appreciation Application Paid (Awaiting Review) - ${app.full_name}`;
        const adminHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
            <div style="padding: 24px; color: #334155;">
              <h2>New Appreciation Application Awaiting Review</h2>
              <p>Hello Admin,</p>
              <p>An appreciation application fee of <strong>INR ${payment.amount}</strong> has been verified for candidate: <strong>${app.full_name}</strong>.</p>
              <p><strong>Application Number:</strong> ${app.application_no}</p>
              <p>Please review the applicant's profile and documents from the admin dashboard to proceed with certificate approval.</p>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/admin/appreciation" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
              </div>
            </div>
          </div>
        `;
        for (const adminEmail of adminRecipients) {
          await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
        }
      } catch (adminErr) {
        console.error("Admin notification error (appreciation):", adminErr);
      }
    }
  }
}
