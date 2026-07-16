"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";
import { sendTransactionalEmail } from "@/services/email/service";

// 1. Fetch memberships list
export async function getMemberships(statusFilter?: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("memberships")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching memberships:", error);
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

  // Strip bucket name from prefix if needed
  // e.g. path is "aadhaar/user_id/file.pdf"
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

// Helper to download files to buffer for Resend email attachments
async function downloadFileToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch attachment from URL: ${url} (status: ${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper to download attachments and send approval email in the background
async function sendApprovalEmailInBackground(
  email: string,
  subject: string,
  html: string,
  attachmentsPayload?: {
    certPdfUrl?: string;
    certPngUrl?: string;
    idCardPdfUrl?: string;
    idCardPngUrl?: string;
  },
  memberName?: string
) {
  const attachments = [];
  try {
    if (attachmentsPayload) {
      const namePrefix = memberName ? memberName.replace(/\s+/g, "_") : "Member";

      if (attachmentsPayload.certPdfUrl) {
        const buf = await downloadFileToBuffer(attachmentsPayload.certPdfUrl);
        attachments.push({ filename: `${namePrefix}_Certificate.pdf`, content: buf });
      }
      if (attachmentsPayload.certPngUrl) {
        const buf = await downloadFileToBuffer(attachmentsPayload.certPngUrl);
        attachments.push({ filename: `${namePrefix}_Certificate.png`, content: buf });
      }
      if (attachmentsPayload.idCardPdfUrl) {
        const buf = await downloadFileToBuffer(attachmentsPayload.idCardPdfUrl);
        attachments.push({ filename: `${namePrefix}_ID_Card.pdf`, content: buf });
      }
      if (attachmentsPayload.idCardPngUrl) {
        const buf = await downloadFileToBuffer(attachmentsPayload.idCardPngUrl);
        attachments.push({ filename: `${namePrefix}_ID_Card.png`, content: buf });
      }
    }
  } catch (err) {
    console.error("[BACKGROUND EMAIL] Error fetching attachment buffers:", err);
  }

  await sendTransactionalEmail(email, subject, html, attachments.length > 0 ? attachments : undefined);
}

// 3. Approve or Reject Membership
export async function updateMembershipStatus(
  id: string,
  newStatus: string,
  remarks: string,
  attachmentsPayload?: {
    certPdfUrl?: string;
    certPngUrl?: string;
    idCardPdfUrl?: string;
    idCardPngUrl?: string;
  }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Fetch current membership status
  const { data: member, error: memberErr } = await supabase
    .from("memberships")
    .select("id, status, full_name, email, membership_no, ack_no")
    .eq("id", id)
    .single();

  if (memberErr || !member) {
    return { success: false, error: "Membership record not found." };
  }

  let finalStatus = newStatus as "APPROVED" | "REJECTED" | "UNDER_REVIEW";
  let generatedMembershipNo = member.membership_no;

  // 1. Generate Membership Number atomically if approving for the first time
  if (newStatus === "APPROVED" && !member.membership_no) {
    const { data: mNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "membership_no",
      p_prefix: "DKM"
    });

    if (rpcError || !mNo) {
      console.error("Failed to generate membership number:", rpcError);
      return { success: false, error: "Failed to generate membership ID sequence." };
    }
    generatedMembershipNo = mNo;
  }

  // 2. Perform updates
  const updatePayload: any = {
    status: finalStatus,
    approved_by: user.id,
    approved_at: newStatus === "APPROVED" ? new Date().toISOString() : null,
    remarks: remarks || null
  };

  if (generatedMembershipNo) {
    updatePayload.membership_no = generatedMembershipNo;
  }

  const { error: updateError } = await supabase
    .from("memberships")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update membership status:", updateError);
    return { success: false, error: "Failed to update record status in database." };
  }

  // 3. Log status transition
  await supabase.from("status_logs").insert({
    membership_id: id,
    from_status: member.status,
    to_status: finalStatus,
    remarks: remarks || `Application status updated to ${finalStatus} by administrator.`,
    updated_by: user.id
  });

  // 4. Send notification email to candidate
  const actionText = finalStatus === "APPROVED" ? "APPROVED" : "REJECTED";
  const emailSubject = `Membership Application ${actionText} - DKFFJ`;
  let emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #001C55; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
      </div>
      <div style="padding: 24px; color: #334155;">
        <h2>Application Status: ${actionText}</h2>
        <p>Dear ${member.full_name},</p>
        <p>Your application for DKFFJ Membership (Acknowledgement: ${member.ack_no}) has been reviewed by the board and was <strong>${actionText}</strong>.</p>
  `;

  if (finalStatus === "APPROVED") {
    emailHtml += `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <span style="font-size: 13px; color: #166534; font-weight: bold; block;">Your Permanent Membership ID:</span>
        <strong style="font-size: 20px; color: #15803d; block; margin-top: 5px;">${generatedMembershipNo}</strong>
      </div>
      <p>Congratulations! You are now a registered member and human rights officer with the DK Foundation. Your official ID card and certificate are attached to this email and can also be downloaded from the tracking portal.</p>
    `;
  } else {
    emailHtml += `
      <p><strong>Remarks from board:</strong> ${remarks || "No specific reasons specified."}</p>
      <p>If you have any doubts, you can submit corrections or contact our state coordinating office.</p>
    `;
  }

  emailHtml += `
        <div style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?type=membership&id=${member.ack_no}" style="background-color: #001C55; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Application Details</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
      </div>
    </div>
  `;

  // Send in background so database response returns immediately to client
  if (finalStatus !== "APPROVED") {
    sendTransactionalEmail(member.email, emailSubject, emailHtml).catch((err) => {
      console.error("sendTransactionalEmail failed:", err);
    });
  }

  return { success: true, membershipNo: generatedMembershipNo };
}

// 4. Update specific membership fields (Photo and Designation) by Admin
export async function updateMembershipFields(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  const id = formData.get("id") as string;
  const designation = formData.get("designation") as string;
  const photo = formData.get("photo") as File | null;

  if (!id || !designation) {
    return { success: false, error: "Membership ID and designation are required." };
  }

  const updatePayload: any = {
    designation,
    updated_at: new Date().toISOString()
  };

  // If a new photo was uploaded, process and upload it to Supabase Storage
  if (photo && photo.size > 0) {
    // Get the user ID of the membership to store in their folder
    const { data: memberData } = await supabase.from("memberships").select("user_id").eq("id", id).single();
    if (!memberData) {
      return { success: false, error: "Membership record not found." };
    }
    const memberUserId = memberData.user_id;

    const photoExt = photo.name.split(".").pop();
    const photoName = `${memberUserId}/photo_${Date.now()}.${photoExt}`;
    const photoBuffer = Buffer.from(await photo.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from("photos")
      .upload(photoName, photoBuffer, { contentType: photo.type, upsert: true });

    if (uploadErr) {
      console.error("Admin photo upload failed:", uploadErr);
      return { success: false, error: `Photo upload failed: ${uploadErr.message}` };
    }

    const { data: photoUrlData } = supabase.storage.from("photos").getPublicUrl(photoName);
    updatePayload.photo_url = photoUrlData.publicUrl;
  }

  const { error: updateErr } = await supabase
    .from("memberships")
    .update(updatePayload)
    .eq("id", id);

  if (updateErr) {
    console.error("Admin membership fields update failed:", updateErr);
    return { success: false, error: "Failed to update record in database." };
  }

  return { success: true };
}

// 5. Secure welcome email dispatch with Certificate and ID Card attachments
export async function dispatchMembershipWelcomeEmail(
  id: string,
  attachmentsPayload: {
    certPdfUrl: string;
    certPngUrl: string;
    idCardPdfUrl: string;
    idCardPngUrl: string;
  }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Fetch membership record
  const { data: member } = await supabase
    .from("memberships")
    .select("full_name, email, membership_no, ack_no")
    .eq("id", id)
    .single();

  if (!member) {
    return { success: false, error: "Membership record not found." };
  }

  const emailSubject = `Membership Application APPROVED - DKFFJ`;
  let emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #001C55; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
      </div>
      <div style="padding: 24px; color: #334155;">
        <h2>Application Status: APPROVED</h2>
        <p>Dear ${member.full_name},</p>
        <p>Your application for DKFFJ Membership (Acknowledgement: ${member.ack_no}) has been reviewed by the board and was <strong>APPROVED</strong>.</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <span style="font-size: 13px; color: #166534; font-weight: bold; block;">Your Permanent Membership ID:</span>
          <strong style="font-size: 20px; color: #15803d; block; margin-top: 5px;">${member.membership_no}</strong>
        </div>
        <p>Congratulations! You are now a registered member and human rights officer with the DK Foundation. Your official ID card and certificate are attached to this email and can also be downloaded from the tracking portal.</p>
        <div style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?type=membership&id=${member.ack_no}" style="background-color: #001C55; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Application Details</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
      </div>
    </div>
  `;

  try {
    const namePrefix = member.full_name ? member.full_name.replace(/\s+/g, "_") : "Member";
    const downloadKeys = [
      { url: attachmentsPayload.certPdfUrl, filename: `${namePrefix}_Certificate.pdf` },
      { url: attachmentsPayload.certPngUrl, filename: `${namePrefix}_Certificate.png` },
      { url: attachmentsPayload.idCardPdfUrl, filename: `${namePrefix}_ID_Card.pdf` },
      { url: attachmentsPayload.idCardPngUrl, filename: `${namePrefix}_ID_Card.png` }
    ];

    // Download all available attachments in parallel to minimize latency and prevent Vercel timeouts
    const attachments = await Promise.all(
      downloadKeys
        .filter(item => !!item.url)
        .map(async item => {
          try {
            const buf = await downloadFileToBuffer(item.url);
            return { filename: item.filename, content: buf };
          } catch (e) {
            console.error(`Failed to download attachment ${item.filename}:`, e);
            return null;
          }
        })
    ).then(results => results.filter((res): res is { filename: string; content: Buffer } => res !== null));

    const emailRes = await sendTransactionalEmail(member.email, emailSubject, emailHtml, attachments.length > 0 ? attachments : undefined);
    if (!emailRes.success) {
      throw new Error(emailRes.error || "Email delivery failed");
    }
    return { success: true };
  } catch (err: any) {
    console.error("dispatchMembershipWelcomeEmail failed:", err);
    return { success: false, error: err.message };
  }
}
