"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";
import { sendTransactionalEmail } from "@/services/email/service";

// 1. Fetch complaints list
export async function getComplaints(statusFilter?: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("complaints")
    .select(`
      *,
      complaint_attachments (
        id,
        file_url,
        file_name,
        file_size
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching complaints:", error);
    return [];
  }
  return data || [];
}

// 2. Update Complaint investigation status
export async function updateComplaintStatus(id: string, newStatus: string, remarks: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Fetch current complaint details
  const { data: complaint, error: fetchErr } = await supabase
    .from("complaints")
    .select("id, status, complaint_no, name, email")
    .eq("id", id)
    .single();

  if (fetchErr || !complaint) {
    return { success: false, error: "Grievance record not found." };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("complaints")
    .update({ status: newStatus })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update complaint status:", updateError);
    return { success: false, error: "Failed to update record in database." };
  }

  // Log status transition
  await supabase.from("status_logs").insert({
    complaint_id: id,
    from_status: complaint.status,
    to_status: newStatus,
    remarks: remarks || `Complaint status updated to ${newStatus} by investigator.`,
    updated_by: user.id
  });

  // Send update email to citizen if email is available
  if (complaint.email) {
    const subject = `Docket Update: ${complaint.complaint_no} - DKFFJ`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #001C55; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h2>Case Investigation Log Updated</h2>
          <p>Dear ${complaint.name},</p>
          <p>This is to inform you that your grievance Docket: <strong>${complaint.complaint_no}</strong> has a status update.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; font-size: 13px;">
              <tr>
                <td style="color: #64748b; padding-bottom: 5px;">Docket Reference:</td>
                <td style="font-weight: bold; text-align: right; padding-bottom: 5px;">${complaint.complaint_no}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Investigation Status:</td>
                <td style="font-weight: bold; color: #001C55; text-align: right;">${newStatus}</td>
              </tr>
            </table>
          </div>
          
          <p><strong>Remarks from Desk:</strong> ${remarks || "Your grievance is under investigation by the state cell."}</p>
          
          <div style="margin-top: 24px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?type=complaint&id=${complaint.complaint_no}" style="background-color: #C00000; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Case History</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
        </div>
      </div>
    `;

    await sendTransactionalEmail(complaint.email, subject, emailHtml);
  }

  return { success: true };
}
