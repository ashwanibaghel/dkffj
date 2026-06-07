"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipReceiptTemplate, getCourseRegistrationReceiptTemplate } from "@/services/email/templates";

export async function verifyAndCompletePayment(transactionId: string) {
  if (!transactionId) {
    return { success: false, error: "Transaction ID is required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch payment record
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, amount, status, membership_id, registration_id")
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
  return { success: false, error: "No reference details found." };
}
