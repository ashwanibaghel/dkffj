"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipReceiptTemplate, getCourseRegistrationReceiptTemplate } from "@/services/email/templates";
import prisma from "@/lib/prisma";

import { verifyAdmin } from "../auth";

type RegistrationCourse = {
  title?: string | null;
};

export async function manuallyApprovePayment(paymentId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Access Denied." };
  }

  if (!paymentId) {
    return { success: false, error: "Payment ID is required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Fetch payment record
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, amount, status, transaction_id, membership_id, registration_id, donation_id")
      .eq("id", paymentId)
      .maybeSingle();

    if (fetchError || !payment) {
      return { success: false, error: "Payment record not found." };
    }

    if (payment.status === "COMPLETED") {
      return { success: false, error: "Payment is already marked as completed." };
    }

    // 2. Update payment status to COMPLETED
    const { error: updatePayError } = await supabase
      .from("payments")
      .update({ 
        status: "COMPLETED",
        remarks: "Manually approved by Administrator"
      })
      .eq("id", payment.id);

    if (updatePayError) {
      console.error("Failed to update payment status:", updatePayError);
      return { success: false, error: "Failed to finalize payment status." };
    }

    // 3. Process linked membership or course registration
    if (payment.membership_id) {
      const { data: membership, error: memberError } = await supabase
        .from("memberships")
        .select("id, ack_no, full_name, email, status")
        .eq("id", payment.membership_id)
        .single();

      if (!memberError && membership) {
        // Update membership status to UNDER_REVIEW
        await supabase
          .from("memberships")
          .update({ status: "UNDER_REVIEW" })
          .eq("id", membership.id);

        // Log status transition
        await supabase.from("status_logs").insert({
          membership_id: membership.id,
          from_status: membership.status,
          to_status: "UNDER_REVIEW",
          remarks: "Manual fee verification completed by administrator. Application under review."
        });

        // Send confirmation email
        const subject = "Payment Verified (Manual) & Membership Submitted - DKFFJ";
        const emailHtml = getMembershipReceiptTemplate(membership.full_name, membership.ack_no, Number(payment.amount));
        await sendTransactionalEmail(membership.email, subject, emailHtml);
      }
    }

    if (payment.donation_id) {
      const donation = await prisma.donations.findUnique({
        where: { id: payment.donation_id }
      });

      if (donation) {
        await prisma.donations.update({
          where: { id: donation.id },
          data: { status: "COMPLETED" }
        });

        // Send email
        const subject = "Donation Successfully Received (Manual Verification) - DKFFJ";
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1565C0; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
            </div>
            <div style="padding: 24px; color: #334155;">
              <h2>Thank You for Your Generous Support!</h2>
              <p>Dear <strong>${donation.donor_name}</strong>,</p>
              <p>We have successfully verified and received your donation of <strong>₹${donation.amount}</strong>.</p>
              <p>Your contribution plays a vital role in enabling our social welfare, education, and human rights advocacy programs.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">Donation Transaction Ref:</span>
                <strong style="font-size: 16px; color: #15803d; display: block; margin-top: 5px; font-family: monospace;">${donation.order_id}</strong>
              </div>
            </div>
          </div>
        `;
        await sendTransactionalEmail(donation.donor_email, subject, emailHtml);
      }
    }

    if (payment.registration_id) {
      const { data: registration, error: regError } = await supabase
        .from("course_registrations")
        .select(`
          id, 
          enrollment_no, 
          full_name, 
          email, 
          status, 
          courses (
            title
          )
        `)
        .eq("id", payment.registration_id)
        .single();

      if (!regError && registration) {
        // Approve immediately on payment completion
        await supabase
          .from("course_registrations")
          .update({ status: "APPROVED" })
          .eq("id", registration.id);

        // Log status transition
        await supabase.from("status_logs").insert({
          registration_id: registration.id,
          from_status: registration.status,
          to_status: "APPROVED",
          remarks: "Course fee manually verified. Enrollment approved."
        });

        // Send email receipt
        const subject = "Course Enrollment Successful - DKFFJ Academy";
        const courseTitle = (registration.courses as RegistrationCourse | null)?.title || "Selected Course";
        const emailHtml = getCourseRegistrationReceiptTemplate(
          registration.full_name,
          courseTitle,
          registration.enrollment_no || "PENDING",
          Number(payment.amount)
        );
        await sendTransactionalEmail(registration.email, subject, emailHtml);
      }
    }

    // Handle appreciation application payment
    if ((payment as any).appreciation_id) {
      const { data: appRecord, error: appErr } = await supabase
        .from("appreciation_applications")
        .select("id, full_name, email, application_no, status")
        .eq("id", (payment as any).appreciation_id)
        .maybeSingle();

      if (!appErr && appRecord && appRecord.status === "PENDING") {
        // Move appreciation to UNDER_REVIEW now that payment is verified
        await supabase
          .from("appreciation_applications")
          .update({ status: "UNDER_REVIEW" })
          .eq("id", appRecord.id);

        // Log status transition
        await supabase.from("status_logs").insert({
          appreciation_id: appRecord.id,
          from_status: appRecord.status,
          to_status: "UNDER_REVIEW",
          remarks: "Appreciation fee manually verified by administrator. Application submitted for board review."
        });

        // Send confirmation email to applicant
        const subject = "Appreciation Application Received & Fee Verified - DKFFJ";
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #001C55; padding: 24px; text-align: center;">
              <img src="https://www.dkffj.org/logo.png" alt="DKFFJ Logo" style="width: 60px; height: 60px; margin-bottom: 10px; display: inline-block;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">DK Foundation of Freedom and Justice</h1>
              <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
            </div>
            <div style="padding: 24px; color: #334155;">
              <h2 style="color: #001C55; margin-top: 0;">Application Received & Payment Verified</h2>
              <p>Dear <strong>${appRecord.full_name}</strong>,</p>
              <p>Your application for a <strong>Certificate of Appreciation</strong> has been received and your payment has been verified by our administration team.</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 4px 0; font-size: 13px;"><strong>Application No:</strong> <span style="color: #C00000; font-family: monospace; font-weight: bold;">${appRecord.application_no}</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">UNDER BOARD REVIEW</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Payment:</strong> <span style="color: #15803d; font-weight: bold;">VERIFIED ✓</span></p>
              </div>
              <p>Your application has been forwarded to the executive board for review. You will be notified via email once a decision has been reached.</p>
            </div>
            <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
            </div>
          </div>
        `;
        await sendTransactionalEmail(appRecord.email, subject, emailHtml);
      }
    }

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error manually approving payment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to process approval." };
  }
}
