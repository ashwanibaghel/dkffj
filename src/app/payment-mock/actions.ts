"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipReceiptTemplate, getCourseRegistrationReceiptTemplate } from "@/services/email/templates";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function verifyAndCompletePayment(transactionId: string) {
  if (!transactionId) {
    return { success: false, error: "Transaction ID is required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch payment record
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, amount, status, membership_id, registration_id, donation_id")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching payment record:", fetchError);
    return { success: false, error: "Database error. Please try again." };
  }

  if (!payment) {
    return { success: false, error: "Transaction record not found." };
  }

  if (payment.status === "COMPLETED") {
    // Already processed, find reference details to redirect
    return await getRedirectDetails(supabase, payment);
  }

  // 2. Call gateway verification
  const verifyRes = await paymentServiceInstance.verify(transactionId, { amount: payment.amount });

  if (!verifyRes.success) {
    return { success: false, error: "Payment verification failed." };
  }

  // 3. Update payment status to COMPLETED
  const { error: updatePayError } = await supabase
    .from("payments")
    .update({ status: "COMPLETED" })
    .eq("id", payment.id);

  if (updatePayError) {
    console.error("Failed to update payment status:", updatePayError);
    return { success: false, error: "Failed to finalize payment status." };
  }

  // 4. Update linked application (Membership or Course Registration)
  if (payment.membership_id) {
    // Fetch membership details
    const { data: membership, error: memberError } = await supabase
      .from("memberships")
      .select("id, ack_no, full_name, email, status")
      .eq("id", payment.membership_id)
      .single();

    if (memberError || !membership) {
      console.error("Failed to fetch membership:", memberError);
      return { success: false, error: "Membership record linked to payment was not found." };
    }

    // Update membership status to UNDER_REVIEW
    const { error: updateMemberError } = await supabase
      .from("memberships")
      .update({ status: "UNDER_REVIEW" })
      .eq("id", membership.id);

    if (updateMemberError) {
      console.error("Failed to update membership status:", updateMemberError);
    }

    // Log status transition
    await supabase.from("status_logs").insert({
      membership_id: membership.id,
      from_status: membership.status,
      to_status: "UNDER_REVIEW",
      remarks: "Fee payment successfully verified. Application forwarded to executive review board."
    });

    // Send payment success & application receipt email
    const subject = "Payment Verified & Membership Submitted - DKFFJ";
    const emailHtml = getMembershipReceiptTemplate(membership.full_name, membership.ack_no, Number(payment.amount));
    await sendTransactionalEmail(membership.email, subject, emailHtml);

    return {
      success: true,
      type: "membership",
      refId: membership.ack_no,
      message: "Membership fee payment verified successfully."
    };
  }

  if (payment.donation_id) {
    // Fetch donation details using Prisma to bypass RLS
    const donation = await prisma.donations.findUnique({
      where: { id: payment.donation_id }
    });

    if (!donation) {
      return { success: false, error: "Donation record linked to payment was not found." };
    }

    // Update donation status to COMPLETED
    try {
      await prisma.donations.update({
        where: { id: donation.id },
        data: { status: "COMPLETED", transaction_id: transactionId }
      });
    } catch (err) {
      console.error("Failed to update donation status via Prisma:", err);
    }

    // Send thank-you receipt email to donor
    const subject = "Donation Successfully Received - Thank You! - DKFFJ";
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #001C55; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
        </div>
        <div style="padding: 24px; color: #334155; text-align: left;">
          <h2>Thank You for Your Generous Support!</h2>
          <p>Dear <strong>${donation.donor_name}</strong>,</p>
          <p>We have successfully received your donation of <strong>₹${donation.amount}</strong> towards <strong>${donation.purpose}</strong>.</p>
          <p>Your contribution plays a vital role in enabling our social welfare, education, and human rights advocacy programs. We are deeply grateful for your support.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">Donation Transaction Ref:</span>
            <strong style="font-size: 16px; color: #15803d; display: block; margin-top: 5px; font-family: monospace;">${donation.order_id}</strong>
          </div>
          <p>You can track your donation status and download your official **Certificate of Appreciation** anytime using the button below:</p>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?type=donation&id=${donation.order_id}" style="background-color: #001C55; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Donation & Download Certificate</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
        </div>
      </div>
    `;
    
    await sendTransactionalEmail(donation.donor_email, subject, emailHtml);

    return {
      success: true,
      type: "donation",
      refId: donation.order_id,
      message: "Donation payment verified successfully."
    };
  }

  if (payment.registration_id) {
    // Fetch course registration details
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

    if (regError || !registration) {
      console.error("Failed to fetch registration:", regError);
      return { success: false, error: "Course registration record linked to payment was not found." };
    }

    // For course registration, approve immediately on payment completion
    const { error: updateRegError } = await supabase
      .from("course_registrations")
      .update({ status: "APPROVED" })
      .eq("id", registration.id);

    if (updateRegError) {
      console.error("Failed to update registration status:", updateRegError);
    }

    // Log status transition
    await supabase.from("status_logs").insert({
      registration_id: registration.id,
      from_status: registration.status,
      to_status: "APPROVED",
      remarks: "Course fee payment verified. Enrollment approved."
    });

    // Send course registration receipt email
    const subject = "Course Enrollment Successful - DKFFJ Academy";
    const courseTitle = (registration.courses as any)?.title || "Selected Course";
    const emailHtml = getCourseRegistrationReceiptTemplate(
      registration.full_name,
      courseTitle,
      registration.enrollment_no || "PENDING",
      Number(payment.amount)
    );
    await sendTransactionalEmail(registration.email, subject, emailHtml);

    return {
      success: true,
      type: "enrollment",
      refId: registration.enrollment_no,
      message: "Academy course payment verified successfully."
    };
  }

  return { success: false, error: "No membership or course registration associated with this transaction." };
}

// Helper function to resolve redirection if transaction is already completed
async function getRedirectDetails(supabase: any, payment: any) {
  if (payment.membership_id) {
    const { data } = await supabase.from("memberships").select("ack_no").eq("id", payment.membership_id).maybeSingle();
    return { success: true, type: "membership", refId: data?.ack_no || "" };
  }
  if (payment.registration_id) {
    const { data } = await supabase.from("course_registrations").select("enrollment_no").eq("id", payment.registration_id).maybeSingle();
    return { success: true, type: "enrollment", refId: data?.enrollment_no || "" };
  }
  if (payment.donation_id) {
    const { data } = await supabase.from("donations").select("order_id").eq("id", payment.donation_id).maybeSingle();
    return { success: true, type: "donation", refId: data?.order_id || "" };
  }
  return { success: false, error: "No reference details found." };
}
