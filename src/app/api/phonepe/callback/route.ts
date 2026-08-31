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
import { finalizeAffiliationPayment } from "@/lib/affiliationPayment";

/** Verify HMAC signature from PhonePe webhook */
function verifyWebhookSignature(rawBody: string, authHeader: string | null): boolean {
  const secret = process.env.PHONEPE_WEBHOOK_SECRET;
  if (!secret) return false;
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
      console.warn("PhonePe webhook signature check failed");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody || "{}");

    // PhonePe sends payload as base64 in body.response: { response: "eyJ..." }
    let merchantOrderId: string = body.merchantOrderId || body.orderId || body.merchantTransactionId || "";

    if (!merchantOrderId && body.response) {
      try {
        const decodedStr = Buffer.from(body.response, "base64").toString("utf-8");
        const decodedJson = JSON.parse(decodedStr);
        merchantOrderId = decodedJson.data?.merchantTransactionId || decodedJson.data?.transactionId || decodedJson.merchantTransactionId || "";
        console.log(`[PHONEPE CALLBACK BASE64 DECODED] Extracted merchantOrderId: ${merchantOrderId}`);
      } catch (decodeErr) {
        console.error("Failed to decode PhonePe base64 payload:", decodeErr);
      }
    }

    if (!merchantOrderId) {
      console.error("Missing merchantOrderId in PhonePe callback payload:", rawBody);
      return NextResponse.json({ error: "Missing merchantOrderId" }, { status: 400 });
    }

    console.info("[PHONEPE_WEBHOOK_RECEIVED]", { merchantOrderId });

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

/**
 * Recovery finalizer for a genuine appreciation payment that was marked
 * complete by an older reconciliation path without promoting its draft number.
 * This is deliberately idempotent: it only allocates a number while DRAFT is
 * still present, so a retry can never consume a second certificate number.
 */
async function finalizeCompletedAppreciationPayment(supabase: any, appreciationId: string) {
  const { data: app, error: appError } = await supabase
    .from("appreciation_applications")
    .select("id, application_no, status")
    .eq("id", appreciationId)
    .maybeSingle();

  if (appError || !app) {
    console.error("[APPRECIATION_FINALIZE] Application not found", { appreciationId, error: appError?.message });
    return;
  }

  let applicationNo = String(app.application_no || "");
  if (applicationNo.includes("DRAFT")) {
    const currentYear = new Date().getFullYear();
    const { data: rawAppNo, error: numberError } = await supabase.rpc("generate_next_number", {
      p_key: "appreciation_app",
      p_prefix: "DKFFJ/A/"
    });
    if (numberError || !rawAppNo) {
      console.error("[APPRECIATION_FINALIZE] Number generation failed", { appreciationId, error: numberError?.message });
      return;
    }

    applicationNo = String(rawAppNo)
      .replace(/DKFFJ\/APP\//g, "DKFFJ/A/")
      .replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/")
      .replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/")
      .replace(/(\d{4})\/-\1-/g, "$1/");
    if (!applicationNo.includes(`/${currentYear}/`)) {
      const seq = applicationNo.split("-").pop()?.padStart(5, "0") || "00001";
      applicationNo = `DKFFJ/A/${currentYear}/${seq}`;
    }
  }

  const { error: updateError } = await supabase
    .from("appreciation_applications")
    .update({ application_no: applicationNo, status: "UNDER_REVIEW" })
    .eq("id", app.id);
  if (updateError) {
    console.error("[APPRECIATION_FINALIZE] Update failed", { appreciationId, error: updateError.message });
    return;
  }

  if (app.status !== "UNDER_REVIEW") {
    await supabase.from("status_logs").insert({
      appreciation_id: app.id,
      from_status: app.status,
      to_status: "UNDER_REVIEW",
      remarks: "Appreciation fee verified via PhonePe. Official application number assigned."
    });
  }
  console.info("[APPRECIATION_FINALIZED]", { appreciationId, applicationNo });
}

/** Core logic: verify with PhonePe → update DB → send email */
export async function processPaymentCompletion(merchantOrderId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Verify with PhonePe
  const verifyResult = await verifyPhonePeOrder(merchantOrderId);
  console.info("[PHONEPE_CALLBACK_GATEWAY_RESULT]", {
    orderId: merchantOrderId,
    gatewaySuccess: verifyResult.success,
    gatewayState: verifyResult.state,
    gatewayAmount: Number(verifyResult.amount)
  });
  if (!verifyResult.success) {
    console.warn(`PhonePe payment not completed for orderId: ${merchantOrderId}`, verifyResult);
    // Only mark as FAILED if PhonePe explicitly confirms failure/declined (NOT for pending/in-progress)
    if (verifyResult.state === "PAYMENT_ERROR" || verifyResult.state === "PAYMENT_DECLINED" || verifyResult.state === "FAILED") {
      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("transaction_id", merchantOrderId)
        .eq("status", "PENDING");
    }
    return;
  }

  // 2. Fetch payment record from DB
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, status, created_at, transaction_id, membership_id, registration_id, donation_id, appreciation_id, affiliation_id")
    .eq("transaction_id", merchantOrderId)
    .maybeSingle();

  if (!payment) {
    console.error("Payment record not found for orderId:", merchantOrderId);
    return;
  }

  // The gateway amount is authoritative. A successful response for a
  // different amount must never unlock an application or issue a certificate.
  if (Number(verifyResult.amount) !== Number(payment.amount)) {
    console.error(`[PHONEPE AMOUNT MISMATCH] ${merchantOrderId}: expected ${payment.amount}, received ${verifyResult.amount}`);
    await supabase
      .from("payments")
      .update({ status: "FAILED", failure_reason: "PhonePe amount did not match the order amount." })
      .eq("id", payment.id)
      .eq("status", "PENDING");
    return;
  }

  if (payment.status === "COMPLETED") {
    console.log("Payment already processed:", merchantOrderId);
    if (payment.appreciation_id) {
      await finalizeCompletedAppreciationPayment(supabase, payment.appreciation_id);
    }
    if (payment.affiliation_id) {
      // Recovery path: a previous webhook may have completed the payment but
      // been interrupted before promoting the affiliation draft.
      await finalizeAffiliationPayment({
        supabase,
        payment,
        gatewayTransactionId: verifyResult.transactionId || merchantOrderId,
        paidAmount: Number(payment.amount)
      });
    }
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
    if (payment.affiliation_id) {
      await finalizeAffiliationPayment({
        supabase,
        payment,
        gatewayTransactionId: verifyResult.transactionId || merchantOrderId,
        paidAmount: Number(payment.amount)
      });
    }
    return;
  }

  if (payment.affiliation_id) {
    await finalizeAffiliationPayment({
      supabase,
      payment,
      gatewayTransactionId: verifyResult.transactionId || merchantOrderId,
      paidAmount: Number(payment.amount)
    });
    return;
  }

  // 4. Handle linked entity

  // --- Membership ---
  if (payment.membership_id) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, ack_no, full_name, father_name, mobile, email, status")
      .eq("id", payment.membership_id)
      .single();

    if (membership) {
      let finalAckNo = membership.ack_no;
      if (!finalAckNo || finalAckNo.includes("DRAFT")) {
        const { data: officialAckNo } = await supabase.rpc("generate_next_number", {
          p_key: "membership_ack",
          p_prefix: "ACK"
        });
        if (officialAckNo) {
          finalAckNo = officialAckNo;
          await supabase.from("memberships").update({ ack_no: officialAckNo, status: "UNDER_REVIEW" }).eq("id", membership.id);
        } else {
          await supabase.from("memberships").update({ status: "UNDER_REVIEW" }).eq("id", membership.id);
        }
      } else {
        await supabase.from("memberships").update({ status: "UNDER_REVIEW" }).eq("id", membership.id);
      }

      await supabase.from("status_logs").insert({
        membership_id: membership.id,
        from_status: membership.status,
        to_status: "UNDER_REVIEW",
        remarks: "Fee payment verified via PhonePe. Sequence number assigned and application forwarded to review board.",
      });

      try {
        const { incrementNamespaceVersion } = await import("@/lib/redis");
        await incrementNamespaceVersion("members");
      } catch (_) {}

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
        const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.org'}/admin/members" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
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

      let attachments: any[] = [];
      try {
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
        const pdfBuffer = await generateReceiptPdfBuffer({
          refId: donation.order_id,
          date: payment.created_at ? new Date(payment.created_at).toISOString() : new Date().toISOString(),
          ackOrEnrollmentNo: donation.order_id,
          gatewayTransactionId: verifyResult.transactionId || "COMPLETED",
          amount: Number(payment.amount),
          description: `Donation Contribution: ${donation.purpose}`,
          customerName: donation.donor_name,
          customerMobile: donation.donor_mobile,
          customerEmail: donation.donor_email
        });
        attachments.push({ filename: `Donation_Receipt_${donation.order_id}.pdf`, content: pdfBuffer });
      } catch (pdfErr) {
        console.error("Failed to generate PDF receipt for donation:", pdfErr);
      }

      await sendTransactionalEmail(
        donation.donor_email,
        "Donation Successfully Received - Thank You! - DKFFJ",
        emailHtml,
        attachments
      );
    }
    return;
  }

  // --- Course Registration ---
  if (payment.registration_id) {
    const { data: registration } = await supabase
      .from("course_registrations")
      .select(`id, enrollment_no, draft_enrollment_no, full_name, email, father_name, mobile, status, courses (title)`)
      .eq("id", payment.registration_id)
      .single();

    if (registration) {
      let finalEnrollmentNo = registration.enrollment_no;
      if (!finalEnrollmentNo || finalEnrollmentNo.includes("DRAFT")) {
        const currentYear = new Date().getFullYear();
        const { data: officialEnrollmentNo } = await supabase.rpc("generate_next_number", {
          p_key: "course_reg",
          p_prefix: `DKFFJ/C/${currentYear}/`
        });
        if (officialEnrollmentNo) {
          const { normalizeCourseEnrollmentNumber } = await import("@/lib/membershipNumber");
          finalEnrollmentNo = normalizeCourseEnrollmentNumber(officialEnrollmentNo);
          await supabase.from("course_registrations").update({
            enrollment_no: finalEnrollmentNo,
            draft_enrollment_no: registration.draft_enrollment_no || registration.enrollment_no,
            status: "APPROVED"
          }).eq("id", registration.id);
        } else {
          await supabase.from("course_registrations").update({ status: "APPROVED" }).eq("id", registration.id);
        }
      } else {
        await supabase.from("course_registrations").update({ status: "APPROVED" }).eq("id", registration.id);
      }

      await supabase.from("status_logs").insert({
        registration_id: registration.id,
        from_status: registration.status,
        to_status: "APPROVED",
        remarks: "Course fee payment verified via PhonePe. Enrollment sequence number assigned & approved.",
      });

      // Email + PDF are best-effort — failures must not crash the function
      try {
        const courseTitle = (registration.courses as any)?.title || "Selected Course";
        const emailHtml = getCourseRegistrationReceiptTemplate(
          registration.full_name,
          courseTitle,
          finalEnrollmentNo || "PENDING",
          Number(payment.amount)
        );

        let attachments: any[] = [];
        try {
          const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
          const pdfBuffer = await generateReceiptPdfBuffer({
            refId: merchantOrderId,
            date: payment.created_at,
            ackOrEnrollmentNo: finalEnrollmentNo || "PENDING",
            gatewayTransactionId: verifyResult.transactionId || "PENDING",
            amount: Number(payment.amount),
            description: courseTitle,
            customerName: registration.full_name,
            fatherName: registration.father_name || "N/A",
            customerMobile: registration.mobile || "",
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
          const courseTitle2 = (registration.courses as any)?.title || "Selected Course";
          const { data: admins } = await supabase
            .from("users")
            .select("email")
            .in("role", ["ADMIN", "SUPERADMIN"]);
          const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
          const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
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
                <p>A new student enrollment fee of <strong>INR ${payment.amount}</strong> has been verified for: <strong>${registration.full_name}</strong> for the course: <strong>${courseTitle2}</strong>.</p>
                <p><strong>Enrollment Number:</strong> ${registration.enrollment_no}</p>
                <p>The student's enrollment has been approved. Please manage this registration from the academy admin panel.</p>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.org'}/admin/registrations" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
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
      } catch (emailErr) {
        console.error("[CALLBACK] Email/PDF failed for course registration — DB already updated, safe to ignore:", emailErr);
      }
    }
  }

  // --- Appreciation Application ---
  if (payment.appreciation_id) {
    const { data: app } = await supabase
      .from("appreciation_applications")
      .select("id, application_no, full_name, email, mobile, status")
      .eq("id", payment.appreciation_id)
      .single();

    if (app) {
      let finalAppNo = app.application_no;
      if (!finalAppNo || finalAppNo.includes("DRAFT")) {
        const currentYear = new Date().getFullYear();
        const { data: rawAppNo } = await supabase.rpc("generate_next_number", {
          p_key: "appreciation_app",
          p_prefix: "DKFFJ/A/"
        });
        if (rawAppNo) {
          let cleanAppNo = rawAppNo
            .replace(/DKFFJ\/APP\//g, "DKFFJ/A/")
            .replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/")
            .replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/")
            .replace(/(\d{4})\/-\1-/g, "$1/");
          if (!cleanAppNo.includes(`/${currentYear}/`)) {
            const parts = cleanAppNo.split("-");
            const seq = parts[parts.length - 1].padStart(5, "0");
            cleanAppNo = `DKFFJ/A/${currentYear}/${seq}`;
          }
          finalAppNo = cleanAppNo;
          await supabase.from("appreciation_applications").update({ application_no: cleanAppNo, status: "UNDER_REVIEW" }).eq("id", app.id);
        } else {
          await supabase.from("appreciation_applications").update({ status: "UNDER_REVIEW" }).eq("id", app.id);
        }
      } else {
        await supabase.from("appreciation_applications").update({ status: "UNDER_REVIEW" }).eq("id", app.id);
      }

      await supabase.from("status_logs").insert({
        appreciation_id: app.id,
        from_status: app.status,
        to_status: "UNDER_REVIEW",
        remarks: "Appreciation fee payment verified via PhonePe. Application sequence number assigned.",
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
        const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.org'}/admin/appreciation" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
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
    return;
  }

  // --- Affiliation Application ---
  const { findDevAffiliationById, updateDevAffiliation } = await import("@/lib/affiliation-dev-store");
  const { AFFILIATION_FEE_AMOUNT, AFFILIATION_FEE_DESCRIPTION, AFFILIATION_FEE_NOTE, AFFILIATION_RECEIPT_PREFIX } = await import("@/lib/affiliation-config");

  // A. Check Dev Store
  const devItem = findDevAffiliationById(merchantOrderId) || findDevAffiliationById(payment.id);
  const affiliationIdFromPayment = (payment as any)?.affiliation_id;
  if (devItem || affiliationIdFromPayment) {
    const affiliationId = affiliationIdFromPayment || devItem?.id;

    // Idempotency check: If already promoted to SUBMITTED with an official AFF-2026-XXXXXX number, exit early
    if (devItem && devItem.status === "SUBMITTED" && devItem.applicationNo && !devItem.applicationNo.startsWith("AFF-DRAFT-")) {
      console.log(`[IDEMPOTENT SKIPPED] Affiliation payment already processed for ${devItem.applicationNo}`);
      return;
    }

    // Amount Verification Check
    const paidAmount = Number(payment.amount || verifyResult.amount || 2100);
    if (paidAmount !== AFFILIATION_FEE_AMOUNT) {
      console.error(`[PAYMENT AMOUNT MISMATCH] Expected ₹${AFFILIATION_FEE_AMOUNT}, received ₹${paidAmount} for orderId: ${merchantOrderId}`);
      await supabase.from("payments").update({ status: "FAILED", failure_reason: `Amount mismatch: Expected ${AFFILIATION_FEE_AMOUNT}, got ${paidAmount}` }).eq("id", payment.id);
      return;
    }

    const currentYear = new Date().getFullYear();
    let officialAppNo = devItem?.applicationNo || "";

    // Generate official AFF-YYYY-XXXXXX number atomically
    if (!officialAppNo || officialAppNo.startsWith("AFF-DRAFT-")) {
      let lastVal = Math.floor(1000 + Math.random() * 9000);
      try {
        const { data: counterData } = await supabase.from("prefixes_counter").select("last_value").eq("key", "AFFILIATION_APP").maybeSingle();
        if (counterData) lastVal = counterData.last_value + 1;
        await supabase.from("prefixes_counter").upsert({ key: "AFFILIATION_APP", year: currentYear, last_value: lastVal });
      } catch (_) {}
      const runningNo = String(lastVal).padStart(6, "0");
      officialAppNo = `AFF-${currentYear}-${runningNo}`;
    }

    const receiptNo = `${AFFILIATION_RECEIPT_PREFIX}${currentYear}/${officialAppNo.split("-").pop() || "000001"}`;
    const paidAtUtc = new Date().toISOString();
    const paidAtIST = `${new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(new Date())} IST`;

    // Update Dev Store
    if (devItem) {
      updateDevAffiliation(devItem.id, {
        applicationNo: officialAppNo,
        status: "SUBMITTED",
        publicRemarks: "Payment verified. Application submitted for board review.",
        payment: {
          transactionId: merchantOrderId,
          gatewayTransactionId: verifyResult.transactionId || merchantOrderId,
          receiptNo,
          amount: paidAmount,
          currency: "INR",
          status: "COMPLETED",
          paidAt: paidAtUtc,
          paidAtIST: paidAtIST
        },
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: "SUBMITTED",
            remarks: `Payment of ₹${paidAmount} verified via PhonePe (Txn ID: ${verifyResult.transactionId || merchantOrderId}). Official App No: ${officialAppNo}`,
            date: paidAtIST
          }
        ]
      });
    }

    // Update Supabase
    try {
      if (affiliationId) {
        await supabase.from("affiliations").update({
          application_no: officialAppNo,
          current_status: "SUBMITTED",
          public_remarks: "Payment verified. Application submitted for board review."
        }).eq("id", affiliationId);

        await supabase.from("payments").update({
          status: "COMPLETED",
          gateway_transaction_id: verifyResult.transactionId || merchantOrderId,
          receipt_no: receiptNo,
          paid_at: paidAtUtc
        }).eq("id", payment.id);

        await supabase.from("status_logs").insert({
          affiliation_id: affiliationId,
          from_status: "DRAFT",
          to_status: "SUBMITTED",
          remarks: `Affiliation fee of ₹${paidAmount} verified via PhonePe. Official App No assigned: ${officialAppNo}`
        });
      }
    } catch (_) {}

    // Send Receipt Email with PDF Attachment
    try {
      const applicantName = devItem?.applicant.fullName || "Applicant";
      const applicantEmail = devItem?.applicant.email || "";
      const instituteName = devItem?.organizationName || "Institute";
      const draftNo = devItem?.draftNo || devItem?.applicationNo || merchantOrderId;

      const { getAffiliationReceiptTemplate } = await import("@/services/email/templates");
      const emailHtml = getAffiliationReceiptTemplate(
        applicantName,
        instituteName,
        draftNo,
        officialAppNo,
        paidAmount,
        verifyResult.transactionId || merchantOrderId,
        receiptNo,
        paidAtIST
      );

      let attachments: any[] = [];
      try {
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
        const pdfBuffer = await generateReceiptPdfBuffer({
          refId: officialAppNo,
          receiptNo,
          date: paidAtIST,
          ackOrEnrollmentNo: officialAppNo,
          gatewayTransactionId: verifyResult.transactionId || merchantOrderId,
          amount: paidAmount,
          description: AFFILIATION_FEE_DESCRIPTION,
          customerName: applicantName,
          customerMobile: devItem?.applicant.mobile || "",
          customerEmail: applicantEmail,
          instituteName,
          receiptType: "AFFILIATION",
          refundPolicyNote: AFFILIATION_FEE_NOTE
        });
        attachments.push({ filename: `Receipt_${receiptNo.replace(/\//g, "_")}.pdf`, content: pdfBuffer });
      } catch (pdfErr) {
        console.error("Failed to generate PDF receipt attachment for affiliation:", pdfErr);
      }

      if (applicantEmail) {
        await sendTransactionalEmail(
          applicantEmail,
          `Affiliation Application Payment Received - ${officialAppNo}`,
          emailHtml,
          attachments
        );
      }

      // Notify Admins
      try {
        const { data: admins } = await supabase
          .from("users")
          .select("email")
          .in("role", ["ADMIN", "SUPERADMIN"]);
        const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
        const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
        const adminSubject = `New Institute Affiliation Application Paid — ${instituteName}`;
        const adminHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 18px;">DK Foundation of Freedom and Justice</h1>
              <div style="color: #e0f2fe; font-size: 11px; margin-top: 4px;">Institute Affiliation Desk</div>
            </div>
            <div style="padding: 24px; color: #334155;">
              <h2>New Affiliation Fee Paid (₹${paidAmount})</h2>
              <p>Hello Admin,</p>
              <p>Affiliation fee payment has been verified for <strong>${instituteName}</strong>.</p>
              <p><strong>Official Application No:</strong> ${officialAppNo}</p>
              <p><strong>Applicant Name:</strong> ${applicantName}</p>
              <p><strong>Receipt No:</strong> ${receiptNo}</p>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.org'}/admin/affiliations" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Review Application in Admin Desk</a>
              </div>
            </div>
          </div>
        `;
        for (const adminEmail of adminRecipients) {
          await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
        }
      } catch (adminErr) {
        console.error("Admin notification error (affiliation):", adminErr);
      }
    } catch (emailErr) {
      console.error("[AFFILIATION CALLBACK] Email error:", emailErr);
    }
  }
}
