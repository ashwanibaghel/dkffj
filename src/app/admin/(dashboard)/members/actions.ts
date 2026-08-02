"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";
import { sendTransactionalEmail } from "@/services/email/service";
import { getVersionedCache, incrementNamespaceVersion } from "@/lib/redis";

// 1. Fetch memberships list
export async function getMemberships(statusFilter?: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Auto-heal: Ensure any membership with a completed payment is at least UNDER_REVIEW
  try {
    const { data: completedPayments } = await supabase
      .from("payments")
      .select("membership_id")
      .eq("status", "COMPLETED")
      .not("membership_id", "is", null);

    if (completedPayments && completedPayments.length > 0) {
      const membershipIds = Array.from(new Set(completedPayments.map((p) => p.membership_id).filter(Boolean)));
      if (membershipIds.length > 0) {
        await supabase
          .from("memberships")
          .update({ status: "UNDER_REVIEW" })
          .in("id", membershipIds)
          .eq("status", "PENDING");
      }
    }
  } catch (err) {
    console.error("Auto-heal membership status error:", err);
  }

  // Force cache bust to ensure fresh data
  try {
    await incrementNamespaceVersion("members");
  } catch (_) {}

  const keySuffix = `list_${statusFilter || "ALL"}`;

  return getVersionedCache("members", keySuffix, async () => {
    let query = supabase
      .from("memberships")
      .select("*")
      .neq("status", "PENDING") // Completely filter out unpaid PENDING applications to prevent accidental admin approval
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "ALL") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching memberships:", error);
      return [];
    }

    const SUPABASE_CDN_BASE = "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/";

    return (data || []).map((m: any) => {
      let photo = m.photo_url || "";
      if (photo && !photo.startsWith("http://") && !photo.startsWith("https://")) {
        const cleanPath = photo.replace(/^\/+/, "").replace(/^uploads\/membership_form\//, "membership_form/");
        if (cleanPath.startsWith("membership_form/")) {
          photo = `${SUPABASE_CDN_BASE}${cleanPath}`;
        } else {
          photo = `${SUPABASE_CDN_BASE}membership_form/${cleanPath}`;
        }
      }
      return {
        ...m,
        photo_url: photo
      };
    });
  });
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

  if (!storagePath) {
    return { success: false, error: "No document attached." };
  }

  // If storagePath is a full http/https URL, return directly
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return { success: true, signedUrl: storagePath };
  }

  // Strip bucket name or leading slashes from prefix
  let cleanPath = storagePath;
  if (storagePath.startsWith(bucket + "/")) {
    cleanPath = storagePath.substring(bucket.length + 1);
  }
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }
  if (cleanPath.startsWith("uploads/membership_form/")) {
    const filename = cleanPath.replace("uploads/membership_form/", "");
    cleanPath = `membership_form/${filename}`;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, 3600); // 1 hour expiry

  if (error || !data) {
    console.error("Error creating signed URL:", error);
    const filename = cleanPath.split("/").pop();
    if (filename && filename !== "default.png") {
      const publicPhotoUrl = `https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/membership_form/${filename}`;
      return { success: true, signedUrl: publicPhotoUrl };
    }
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
    const currentYear = new Date().getFullYear();
    const { data: mNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "membership_no",
      p_prefix: `DKFFJ/M/${currentYear}/`
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
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
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

export type UpdateMemberPayload = {
  id: string;
  fullName: string;
  fatherName: string;
  gender: string;
  dob: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  education?: string;
  profession?: string;
  workingArea?: string;
  designation: string;
  policeStation?: string;
  membershipNo?: string;
  photoUrl?: string;
  aadhaarUrl?: string;
  signatureUrl?: string;
};

// 4. Update all membership fields by Admin
export async function updateMembershipFields(payload: UpdateMemberPayload) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  if (!payload.id || !payload.fullName || !payload.mobile) {
    return { success: false, error: "Member ID, full name, and mobile number are required." };
  }

  const updatePayload: any = {
    full_name: payload.fullName.trim(),
    father_name: payload.fatherName.trim(),
    gender: payload.gender,
    dob: payload.dob,
    mobile: payload.mobile.trim(),
    whatsapp: payload.whatsapp ? payload.whatsapp.trim() : payload.mobile.trim(),
    email: payload.email.trim().toLowerCase(),
    address: payload.address.trim(),
    state: payload.state.trim(),
    district: payload.district.trim(),
    pincode: payload.pincode.trim(),
    education: payload.education ? payload.education.trim() : "Graduate",
    profession: payload.profession ? payload.profession.trim() : "Social Worker",
    working_area: payload.workingArea ? payload.workingArea.trim() : "Human Rights",
    designation: payload.designation || "Member",
    police_station: payload.policeStation ? payload.policeStation.trim() : null,
    updated_at: new Date().toISOString()
  };

  if (payload.membershipNo !== undefined) {
    updatePayload.membership_no = payload.membershipNo ? payload.membershipNo.trim() : null;
  }

  if (payload.photoUrl) {
    updatePayload.photo_url = payload.photoUrl;
  }
  if (payload.aadhaarUrl) {
    updatePayload.aadhaar_url = payload.aadhaarUrl;
  }
  if (payload.signatureUrl) {
    updatePayload.signature_url = payload.signatureUrl;
  }

  const { error: updateErr } = await supabase
    .from("memberships")
    .update(updatePayload)
    .eq("id", payload.id);

  if (updateErr) {
    console.error("Admin membership update failed:", updateErr);
    return { success: false, error: `Failed to update member: ${updateErr.message}` };
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
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
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

// 6. Fetch latest member print data and pre-resolve images to Base64 to bypass client CORS
export async function getMemberPrintData(id: string, qrCodeUrl: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: member, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !member) {
    return { success: false, error: "Member record not found" };
  }

  let photoBase64 = "";
  let qrBase64 = "";

  // Fetch photo and convert to base64 on server side
  if (member.photo_url) {
    try {
      const res = await fetch(member.photo_url);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = res.headers.get("content-type") || "image/jpeg";
        photoBase64 = `data:${contentType};base64,${base64}`;
      }
    } catch (e) {
      console.error("Failed to convert photoUrl on server:", e);
    }
  }

  // Fetch QR code and convert to base64 on server side
  if (qrCodeUrl) {
    try {
      const res = await fetch(qrCodeUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = res.headers.get("content-type") || "image/png";
        qrBase64 = `data:${contentType};base64,${base64}`;
      }
    } catch (e) {
      console.error("Failed to convert qrCodeUrl on server:", e);
    }
  }

  return {
    success: true,
    member: member as any,
    photoBase64,
    qrBase64
  };
}

export type AddMemberAdminPayload = {
  fullName: string;
  fatherName: string;
  gender: string;
  dob: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  education?: string;
  profession?: string;
  workingArea?: string;
  designation: string;
  policeStation?: string;
  photoUrl: string;
  aadhaarUrl: string;
  signatureUrl: string;
  paymentStatus: "DONE" | "NOT_DONE";
};

export async function addMemberByAdminAction(payload: AddMemberAdminPayload) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Access Denied. Admin authorization required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  try {
    const currentYear = new Date().getFullYear();

    // 1. Resolve or auto-create User ID for candidate so user_id is never empty
    let candidateUserId: string | null = null;
    const cleanEmail = payload.email.trim().toLowerCase();

    const { data: existingUser } = await supabase.from("users").select("id").eq("email", cleanEmail).maybeSingle();
    if (existingUser?.id) {
      candidateUserId = existingUser.id;
    } else {
      const { data: existingMbr } = await supabase.from("memberships").select("user_id").eq("email", cleanEmail).not("user_id", "is", null).maybeSingle();
      if (existingMbr?.user_id) {
        candidateUserId = existingMbr.user_id;
      } else {
        try {
          const autoPass = "DKM@" + Math.random().toString(36).substring(2, 10) + "!";
          const { data: createdId } = await supabase.rpc("create_auth_user", {
            p_email: cleanEmail,
            p_password: autoPass,
            p_full_name: payload.fullName.trim()
          });
          if (createdId) {
            candidateUserId = createdId as string;
          }
        } catch (err) {
          console.warn("create_auth_user RPC notice:", err);
        }
      }
    }

    if (!candidateUserId) {
      candidateUserId = user.id;
    }

    // 2. Generate ACK Number
    const { data: ackNoData } = await supabase.rpc("generate_next_number", {
      p_key: "membership_ack",
      p_prefix: "DKE-MIG-"
    });
    const ackNo = ackNoData || `DKE-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    let status = "UNDER_REVIEW";
    let membershipNo: string | null = null;
    let approvedAt: string | null = null;
    let approvedBy: string | null = null;

    // 3. If Payment Done, generate membership_no atomically and set APPROVED
    if (payload.paymentStatus === "DONE") {
      status = "APPROVED";
      approvedAt = new Date().toISOString();
      approvedBy = user.id;

      const { data: mNoData, error: mNoErr } = await supabase.rpc("generate_next_number", {
        p_key: "membership_no",
        p_prefix: `DKFFJ/M/${currentYear}/`
      });

      if (mNoErr || !mNoData) {
        console.error("RPC generate_next_number failed:", mNoErr);
        const { count } = await supabase
          .from("memberships")
          .select("*", { count: "exact", head: true });
        membershipNo = `DKFFJ/M/${currentYear}/${String((count || 0) + 1).padStart(4, "0")}`;
      } else {
        membershipNo = mNoData;
      }
    }

    // 4. Insert membership record with resolved user_id
    const { data: newMember, error: insertErr } = await supabase
      .from("memberships")
      .insert({
        user_id: candidateUserId,
        ack_no: ackNo,
        full_name: payload.fullName.trim(),
        father_name: payload.fatherName.trim(),
        gender: payload.gender,
        dob: payload.dob,
        mobile: payload.mobile.trim(),
        whatsapp: payload.whatsapp ? payload.whatsapp.trim() : payload.mobile.trim(),
        email: cleanEmail,
        address: payload.address.trim(),
        state: payload.state.trim(),
        district: payload.district.trim(),
        pincode: payload.pincode.trim(),
        education: payload.education ? payload.education.trim() : "Graduate",
        profession: payload.profession ? payload.profession.trim() : "Social Worker",
        working_area: payload.workingArea ? payload.workingArea.trim() : "Human Rights",
        designation: payload.designation || "Member",
        police_station: payload.policeStation ? payload.policeStation.trim() : null,
        photo_url: payload.photoUrl,
        aadhaar_url: payload.aadhaarUrl,
        signature_url: payload.signatureUrl,
        status: status,
        membership_no: membershipNo,
        approved_at: approvedAt,
        approved_by: approvedBy,
        remarks: payload.paymentStatus === "DONE" 
          ? "Added by Administrator with Payment Done (Instant Approval)"
          : "Added by Administrator with Payment Pending"
      })
      .select()
      .single();

    if (insertErr || !newMember) {
      console.error("Error creating membership by admin:", insertErr);
      return { success: false, error: insertErr?.message || "Failed to create member record." };
    }

    // Log status transition
    await supabase.from("status_logs").insert({
      membership_id: newMember.id,
      from_status: "DRAFT",
      to_status: status,
      remarks: payload.paymentStatus === "DONE" ? "Created and Approved directly by Admin" : "Created by Admin (Payment Pending)",
      updated_by: user.id
    });

    return {
      success: true,
      member: newMember,
      membershipNo: membershipNo,
      status: status,
      message: payload.paymentStatus === "DONE"
        ? `Member added & approved successfully! Permanent ID: ${membershipNo}`
        : `Member added with Payment Pending status successfully!`
    };
  } catch (err: any) {
    console.error("Error in addMemberByAdminAction:", err);
    return { success: false, error: err?.message || "An unexpected error occurred." };
  }
}

// 7. Update member validity / renew membership date
export async function updateMemberValidityAction(memberId: string, validUntilDateStr: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication failed." };

  const validUntilDate = new Date(validUntilDateStr);
  if (isNaN(validUntilDate.getTime())) {
    return { success: false, error: "Invalid date format provided." };
  }

  const { data: updatedMember, error: updateErr } = await supabase
    .from("memberships")
    .update({
      valid_until: validUntilDate.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", memberId)
    .select()
    .single();

  if (updateErr) {
    console.error("Error updating member validity:", updateErr);
    return { success: false, error: updateErr.message || "Failed to update membership validity." };
  }

  // Log status transition / renewal log
  await supabase.from("status_logs").insert({
    membership_id: memberId,
    from_status: updatedMember.status,
    to_status: updatedMember.status,
    remarks: `Membership validity renewed until ${validUntilDate.toISOString().split("T")[0]} by Admin`,
    updated_by: user.id
  });

  return {
    success: true,
    member: updatedMember,
    message: `Membership validity updated successfully until ${validUntilDate.toLocaleDateString("en-IN")}!`
  };
}

// 8. Toggle Home Page Visibility (show_home)
export async function toggleMemberShowHomeAction(memberId: string, currentShowHome: boolean) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const newShowHome = !currentShowHome;

  const { error } = await supabase
    .from("memberships")
    .update({ show_home: newShowHome, updated_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) {
    console.error("Error toggling show_home:", error);
    return { success: false, error: error.message };
  }

  // Increment version to trigger Cache Miss & load fresh data
  await incrementNamespaceVersion("members");

  return { success: true, showHome: newShowHome };
}

// 9. Toggle Active / Inactive Status
export async function toggleMemberActiveStatusAction(memberId: string, currentStatus: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // If APPROVED, toggle to REJECTED/UNDER_REVIEW (Inactive), else set APPROVED (Active)
  const newStatus = currentStatus === "APPROVED" ? "REJECTED" : "APPROVED";

  const { error } = await supabase
    .from("memberships")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) {
    console.error("Error toggling active status:", error);
    return { success: false, error: error.message };
  }

  // Increment version to trigger Cache Miss & load fresh data
  await incrementNamespaceVersion("members");

  return { success: true, status: newStatus };
}

// 10. Delete Membership Record
export async function deleteMembership(memberId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Delete linked payments and logs first
  await supabase.from("payments").delete().eq("membership_id", memberId);
  await supabase.from("status_logs").delete().eq("membership_id", memberId);

  const { error } = await supabase.from("memberships").delete().eq("id", memberId);
  if (error) {
    console.error("Error deleting membership:", error);
    return { success: false, error: error.message || "Failed to delete membership." };
  }

  await incrementNamespaceVersion("members");
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/members");
  return { success: true, message: "Membership deleted successfully." };
}

