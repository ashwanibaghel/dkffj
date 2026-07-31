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

  // Auto-heal: Ensure any appreciation application with a completed payment is promoted to UNDER_REVIEW
  try {
    const { data: completedPayments } = await supabase
      .from("payments")
      .select("appreciation_id")
      .eq("status", "COMPLETED")
      .not("appreciation_id", "is", null);

    if (completedPayments && completedPayments.length > 0) {
      const appIds = Array.from(new Set(completedPayments.map((p) => p.appreciation_id).filter(Boolean)));
      if (appIds.length > 0) {
        await supabase
          .from("appreciation_applications")
          .update({ status: "UNDER_REVIEW" })
          .in("id", appIds)
          .eq("status", "PENDING");
      }
    }
  } catch (err) {
    console.error("Auto-heal appreciation status error:", err);
  }

  let query = supabase
    .from("appreciation_applications")
    .select("*")
    .neq("status", "PENDING") // Completely filter out unpaid/pending appreciation applications from admin panel until payment is verified
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
export async function updateAppreciationStatus(
  id: string, 
  newStatus: string, 
  remarks: string,
  pdfBase64?: string,
  jpgBase64?: string
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Validate admin auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized access." };

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
      return { success: false, error: "Access Denied." };
    }

    // Verify if user.id exists in public.users to prevent FK constraint failure
    let validUserId: string | null = null;
    if (user?.id) {
      const { data: dbUser } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();
      if (dbUser) {
        validUserId = user.id;
      }
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
        approved_by: validUserId,
        approved_at: newStatus === "APPROVED" ? new Date().toISOString() : null,
        remarks: remarks || null
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update appreciation status:", updateError);
      return { success: false, error: "Failed to update record status in database: " + updateError.message };
    }

    // 2. Log status transition safely
    try {
      await supabase.from("status_logs").insert({
        appreciation_id: id,
        from_status: app.status,
        to_status: finalStatus,
        remarks: remarks || `Application status updated to ${finalStatus} by administrator.`,
        updated_by: validUserId
      });
    } catch (logErr) {
      console.error("Failed to insert appreciation status log:", logErr);
    }

    // 3. Construct attachments if approved
    const attachments: Array<{ filename: string; content: Buffer }> = [];
    if (finalStatus === "APPROVED") {
      const sanitizedAppNo = (app.application_no || "DKFFJ_Appreciation").replace(/\//g, "_");
      if (pdfBase64) {
        attachments.push({
          filename: `Certificate_of_Appreciation_${sanitizedAppNo}.pdf`,
          content: Buffer.from(pdfBase64, "base64")
        });
      }
      if (jpgBase64) {
        attachments.push({
          filename: `Certificate_of_Appreciation_${sanitizedAppNo}.jpg`,
          content: Buffer.from(jpgBase64, "base64")
        });
      }
    }

    // 4. Send notification email to candidate safely in background
    try {
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
          <p style="margin: 4px 0; font-size: 13px; color: #1E60B4;"><strong>Attachments:</strong> Official Certificate attached in both PDF (.pdf) and Image (.jpg) formats.</p>
          <p>You can also verify and download a digital copy of your Certificate of Appreciation from the portal:</p>
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

      await sendTransactionalEmail(app.email, emailSubject, emailHtml, attachments.length > 0 ? attachments : undefined);
    } catch (emailErr) {
      console.error("Failed to send appreciation notification email:", emailErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unhandled error in updateAppreciationStatus:", err);
    return { success: false, error: err?.message || "An unexpected error occurred during appreciation approval." };
  }
}

// 4. Create Direct VIP / Free Appreciation Certificate (Direct Approval & Email Delivery)
export async function createDirectAppreciationApplication(payload: {
  fullName: string;
  fatherName: string;
  mobile: string;
  email: string;
  gender: string;
  dob?: string;
  address?: string;
  country?: string;
  state: string;
  district: string;
  pincode: string;
  socialWorkField: string;
  description?: string;
  photoUrl?: string;
  idProofUrl?: string;
  achievementProofUrl?: string;
  remarks?: string;
  pdfBase64?: string;
  jpgBase64?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  try {
    // 1. Generate clean application number
    const currentYear = new Date().getFullYear();
    const { data: rawAppNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "appreciation_app",
      p_prefix: "DKFFJ/A/"
    });

    if (rpcError || !rawAppNo) {
      console.error("RPC sequence generation error:", rpcError);
      return { success: false, error: "Failed to generate application number." };
    }

    let appNo = rawAppNo
      .replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/")
      .replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/")
      .replace(/(\d{4})\/-\1-/g, "$1/");

    if (!appNo.includes(`/${currentYear}/`)) {
      const parts = appNo.split("-");
      const seq = parts[parts.length - 1].padStart(5, "0");
      appNo = `DKFFJ/A/${currentYear}/${seq}`;
    }

    // Combine supplementary details into narrative description
    let fullDescription = payload.description || "Direct VIP Appreciation Certificate issued by Executive Board.";
    if (payload.fatherName || payload.dob || payload.gender) {
      fullDescription += ` [Father's Name: ${payload.fatherName || 'N/A'}, Gender: ${payload.gender || 'N/A'}, DOB: ${payload.dob || 'N/A'}]`;
    }

    // 2. Direct insert with APPROVED status using exact table columns
    const { data: newApp, error: insertError } = await supabase
      .from("appreciation_applications")
      .insert({
        application_no: appNo,
        user_id: user.id,
        full_name: payload.fullName,
        mobile: payload.mobile,
        email: payload.email,
        address: payload.address || `${payload.district}, ${payload.state}`,
        country: payload.country || "India",
        state: payload.state,
        district: payload.district,
        pincode: payload.pincode,
        social_work_field: payload.socialWorkField,
        description: fullDescription,
        photo_url: payload.photoUrl || null,
        id_proof_url: payload.idProofUrl || null,
        achievement_proof_url: payload.achievementProofUrl || null,
        status: "APPROVED",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        remarks: payload.remarks || "Direct VIP / Honoris Causa Appreciation Certificate issued by Board."
      })
      .select("*")
      .single();

    if (insertError || !newApp) {
      console.error("Insert appreciation application error:", insertError);
      return { success: false, error: `Failed to issue certificate: ${insertError?.message || "DB Insert Error"}` };
    }

    // 3. Insert payment log with status COMPLETED & amount 0 (Free/VIP)
    const tempTxnId = "FREE-VIP-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    await supabase.from("payments").insert({
      amount: 0,
      transaction_id: tempTxnId,
      gateway: "ADMIN_VIP_FREE",
      status: "COMPLETED",
      appreciation_id: newApp.id
    });

    // 4. Log status transition
    await supabase.from("status_logs").insert({
      appreciation_id: newApp.id,
      from_status: "DRAFT",
      to_status: "APPROVED",
      remarks: "Direct VIP / Free Appreciation Certificate issued directly by Admin.",
      updated_by: user.id
    });

    // 5. Build Attachments Array (PDF and JPG)
    const attachments: Array<{ filename: string; content: Buffer }> = [];
    const sanitizedAppNo = appNo.replace(/\//g, "_");

    if (payload.pdfBase64) {
      attachments.push({
        filename: `Certificate_of_Appreciation_${sanitizedAppNo}.pdf`,
        content: Buffer.from(payload.pdfBase64, "base64")
      });
    }

    if (payload.jpgBase64) {
      attachments.push({
        filename: `Certificate_of_Appreciation_${sanitizedAppNo}.jpg`,
        content: Buffer.from(payload.jpgBase64, "base64")
      });
    }

    // 6. Send Email with Certificate & Download Link & Attachments
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.dkffj.org";
    const trackUrl = `${appUrl}/track?type=appreciation&id=${encodeURIComponent(appNo)}`;

    const emailSubject = `Certificate of Appreciation Issued - DKFFJ`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #001C55; padding: 24px; text-align: center;">
          <img src="${appUrl}/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: sans-serif; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
          <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
          <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h2 style="color: #001C55; margin-top: 0;">Certificate of Appreciation Issued</h2>
          <p>Dear <strong>${payload.fullName}</strong>,</p>
          <p>We are honored to inform you that the executive board of <strong>DK Foundation of Freedom and Justice</strong> has officially awarded and issued your <strong>Certificate of Appreciation</strong> in recognition of your distinguished service and contributions (<em>${payload.socialWorkField}</em>).</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Certificate Reference No:</strong> <span style="color: #C00000; font-family: monospace; font-weight: bold;">${appNo}</span></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Social Work Category:</strong> ${payload.socialWorkField}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #15803d; font-weight: bold;">OFFICIALLY APPROVED & ISSUED</span></p>
            <p style="margin: 4px 0; font-size: 13px; color: #1E60B4;"><strong>Attachments:</strong> Official Certificate attached in both PDF (.pdf) and Image (.jpg) formats.</p>
          </div>

          <p>You can also instantly view, verify, and download your official digital Certificate of Appreciation from the portal:</p>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${trackUrl}" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">View & Download Certificate</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
        </div>
      </div>
    `;

    const emailRes = await sendTransactionalEmail(payload.email, emailSubject, emailHtml, attachments.length > 0 ? attachments : undefined);
    console.log("[VIP CERT EMAIL RESULT]", JSON.stringify(emailRes));

    return { 
      success: true, 
      applicationNo: appNo, 
      data: newApp,
      emailDelivered: emailRes.success,
      emailError: emailRes.error || null
    };
  } catch (err: any) {
    console.error("createDirectAppreciationApplication exception:", err);
    return { success: false, error: err.message || "Failed to create direct appreciation certificate." };
  }
}

// 5. Resend Appreciation Certificate Email with PDF & JPG attachments
export async function resendAppreciationCertificateEmail(payload: {
  applicationNo: string;
  fullName: string;
  email: string;
  socialWorkField: string;
  pdfBase64?: string;
  jpgBase64?: string;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access." };
  }

  if (!payload.email) {
    return { success: false, error: "Candidate email is missing." };
  }

  const appNo = payload.applicationNo;
  const sanitizedAppNo = appNo.replace(/[\/\\]/g, "_");

  const attachments: any[] = [];
  if (payload.pdfBase64) {
    attachments.push({
      filename: `Certificate_of_Appreciation_${sanitizedAppNo}.pdf`,
      content: Buffer.from(payload.pdfBase64, "base64")
    });
  }
  if (payload.jpgBase64) {
    attachments.push({
      filename: `Certificate_of_Appreciation_${sanitizedAppNo}.jpg`,
      content: Buffer.from(payload.jpgBase64, "base64")
    });
  }

  const appUrl = "https://www.dkffj.org";
  const trackUrl = `${appUrl}/verify/${sanitizedAppNo.replace(/_/g, "/")}`;

  const emailSubject = `Official Certificate of Appreciation - DKFFJ (Updated Copy)`;
  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <img src="${appUrl}/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: sans-serif; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
        <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
      </div>
      <div style="padding: 24px; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0;">Official Certificate of Appreciation (Updated Copy)</h2>
        <p>Dear <strong>${payload.fullName}</strong>,</p>
        <p>Please find attached your updated official <strong>Certificate of Appreciation</strong> issued by the executive board of <strong>DK Foundation of Freedom and Justice</strong> in recognition of your distinguished service (<em>${payload.socialWorkField}</em>).</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Certificate Serial:</strong> <span style="color: #C00000; font-family: monospace; font-weight: bold;">${appNo}</span></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Social Work Category:</strong> ${payload.socialWorkField}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #15803d; font-weight: bold;">OFFICIALLY VERIFIED &amp; ISSUED</span></p>
          <p style="margin: 4px 0; font-size: 13px; color: #1E60B4;"><strong>Attachments Included:</strong> High-Resolution Certificate attached in both PDF (.pdf) and Image (.jpg) formats.</p>
        </div>

        <p>You can also verify your certificate live online at any time by scanning the QR code or visiting our official registry portal:</p>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${trackUrl}" style="background-color: #15803d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Verify Certificate Online</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;

  const emailRes = await sendTransactionalEmail(payload.email, emailSubject, emailHtml, attachments.length > 0 ? attachments : undefined);

  if (emailRes.success) {
    return { success: true, message: `Certificate email resent successfully to ${payload.email}` };
  } else {
    return { success: false, error: emailRes.error || "Failed to deliver email." };
  }
}

// 5. Delete Appreciation Application
export async function deleteAppreciationApplication(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Delete linked payments and logs first
  await supabase.from("payments").delete().eq("appreciation_id", id);
  await supabase.from("status_logs").delete().eq("appreciation_id", id);
  
  const { error } = await supabase.from("appreciation_applications").delete().eq("id", id);
  if (error) {
    console.error("Error deleting appreciation application:", error);
    return { success: false, error: error.message || "Failed to delete appreciation record." };
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/appreciation");
  return { success: true, message: "Appreciation application deleted successfully." };
}

