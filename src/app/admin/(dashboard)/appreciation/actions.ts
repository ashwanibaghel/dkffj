"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";
import { sendTransactionalEmail } from "@/services/email/service";

// 1. Fetch appreciation applications list
export async function getAppreciationApplications(statusFilter?: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("appreciation_applications")
    .select("*")
    .neq("status", "PENDING") // Hide unpaid appreciation applications from admin panel
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching appreciation applications:", error);
    return [];
  }
  return data || [];
}

// 2. Generate signed document URL for secure viewing
export async function getSignedDocumentUrl(bucket: string, storagePath: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  let cleanPath = storagePath;
  if (storagePath.startsWith(bucket + "/")) {
    cleanPath = storagePath.substring(bucket.length + 1);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, 60); // 60 seconds expiry

  if (error || !data) {
    console.error("Error creating signed URL:", error);
    return { success: false, error: "Failed to generate download link." };
  }

  return { success: true, signedUrl: data.signedUrl };
}

// 3. Approve or Reject Appreciation Application
export async function updateAppreciationStatus(id: string, newStatus: string, remarks: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Fetch current application details
  const { data: app, error: appErr } = await supabase
    .from("appreciation_applications")
    .select("id, status, full_name, email, application_no")
    .eq("id", id)
    .single();

  if (appErr || !app) {
    return { success: false, error: "Appreciation application record not found." };
  }

  const finalStatus = newStatus as "APPROVED" | "REJECTED" | "UNDER_REVIEW";

  // 1. Perform updates
  const { error: updateError } = await supabase
    .from("appreciation_applications")
    .update({
      status: finalStatus,
      approved_by: user.id,
      approved_at: newStatus === "APPROVED" ? new Date().toISOString() : null,
      remarks: remarks || null
    })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update appreciation status:", updateError);
    return { success: false, error: "Failed to update record status in database." };
  }

  // 2. Log status transition
  await supabase.from("status_logs").insert({
    appreciation_id: id,
    from_status: app.status,
    to_status: finalStatus,
    remarks: remarks || `Application status updated to ${finalStatus} by administrator.`,
    updated_by: user.id
  });

  // 3. Send notification email to candidate
  const actionText = finalStatus === "APPROVED" ? "APPROVED" : finalStatus === "REJECTED" ? "REJECTED" : "UNDER BOARD REVIEW";
  const emailSubject = `Appreciation Application ${actionText} - DKFFJ`;
  let emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 24px; color: #334155;">
        <h2>Application Status: ${actionText}</h2>
        <p>Dear ${app.full_name},</p>
        <p>Your application for a Certificate of Appreciation (Application No: ${app.application_no}) has been reviewed by the board and was <strong>${actionText}</strong>.</p>
  `;

  if (finalStatus === "APPROVED") {
    emailHtml += `
      <p>Congratulations! The executive board has approved and issued your Certificate of Appreciation in recognition of your outstanding social contributions.</p>
      <p>You can verify and download a digital copy of your Certificate of Appreciation from the portal:</p>
      <div style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/track?type=appreciation&id=${app.application_no}" style="background-color: #15803d; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">View & Download Certificate</a>
      </div>
    `;
  } else if (finalStatus === "REJECTED") {
    emailHtml += `
      <p><strong>Remarks from board:</strong> ${remarks || "No specific reason specified."}</p>
      <p>If you have any queries or additional achievements evidence to submit, please get in touch with our coordinating team.</p>
    `;
  } else {
    emailHtml += `
      <p>Your application is currently under detailed board review. We will notify you as soon as a final decision is reached.</p>
    `;
  }

  emailHtml += `
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
      </div>
    </div>
  `;

  await sendTransactionalEmail(app.email, emailSubject, emailHtml);

  return { success: true };
}
