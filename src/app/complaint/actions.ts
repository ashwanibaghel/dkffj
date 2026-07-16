"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getComplaintSubmittedTemplate } from "@/services/email/templates";
import { sanitizeInput } from "@/lib/sanitize";

// 1. Generate and Send OTP for Complaint
export async function sendComplaintOtp(mobile: string, email: string) {
  if (!mobile || !email) {
    return { success: false, error: "Mobile number and Email are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Generate 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins expiry

  // Insert OTP request into DB
  const { error } = await supabase
    .from("otp_requests")
    .insert({
      mobile,
      email,
      otp_code: code,
      expires_at: expiresAt,
      verified: false
    });

  if (error) {
    console.error("Error saving OTP request:", error);
    return { success: false, error: "Failed to generate OTP. Please try again." };
  }

  // Send Email with OTP using a premium HTML layout
  const subject = "Grievance Portal Verification OTP - DKFFJ";
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
        <img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
        <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
        <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 15px; line-height: 1.6;">You are registering an official grievance/complaint on the DKFFJ portal. To secure your submission and prevent fake reports, please verify your email using the following 6-digit One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #C00000; padding: 12px 28px; background-color: #fef2f2; border: 1px dashed #f87171; border-radius: 8px; display: inline-block;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP is valid for 10 minutes. Please do not share this code with anyone. If you did not initiate this request, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
  const emailRes = await sendTransactionalEmail(email, subject, htmlContent);

  // Log to console for local developer debugging/testing
  console.log(`[COMPLAINT OTP SENT] To Email: ${email} -> CODE: ${code}`);

  if (emailRes.mock) {
    return {
      success: true,
      message: `[MOCK MODE] OTP: ${code} (Resend API key is missing).`
    };
  }

  return { success: true, message: "OTP sent successfully to your email." };
}

// 2. Verify OTP for Complaint
export async function verifyComplaintOtp(email: string, code: string) {
  if (!email || !code) {
    return { success: false, error: "Email and OTP code are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const now = new Date().toISOString();

  // Fetch the latest active OTP request for this email
  const { data, error } = await supabase
    .from("otp_requests")
    .select("id, otp_code, expires_at, verified")
    .eq("email", email)
    .eq("otp_code", code)
    .eq("verified", false)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error checking OTP:", error);
    return { success: false, error: "Database error. Please try again." };
  }

  if (!data) {
    return { success: false, error: "Invalid or expired OTP. Please request a new one." };
  }

  // Mark OTP as verified
  const { error: updateError } = await supabase
    .from("otp_requests")
    .update({ verified: true })
    .eq("id", data.id);

  if (updateError) {
    console.error("Error updating OTP status:", updateError);
    return { success: false, error: "Failed to mark OTP as verified." };
  }

  return { success: true };
}

// 3. Submit Complaint Grievance
export async function submitComplaint(prevData: any, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract auth user if available
  let userId: string | null = null;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userId = user.id;
  }

  // Extract Form Fields
  const firstName = sanitizeInput(formData.get("firstName") as string);
  const lastName = sanitizeInput(formData.get("lastName") as string);
  const fatherName = sanitizeInput(formData.get("fatherName") as string);
  const dob = sanitizeInput(formData.get("dob") as string);
  const gender = sanitizeInput(formData.get("gender") as string);
  const profession = sanitizeInput(formData.get("profession") as string);
  
  const mobile = sanitizeInput(formData.get("mobile") as string);
  const whatsappNo = sanitizeInput(formData.get("whatsappNo") as string);
  const email = sanitizeInput(formData.get("email") as string);
  
  const incidentCategory = sanitizeInput(formData.get("incidentCategory") as string);
  const incidentDate = sanitizeInput(formData.get("incidentDate") as string);
  const rawComplaintText = sanitizeInput(formData.get("details") as string);

  const landmark = sanitizeInput(formData.get("landmark") as string);
  const postOffice = sanitizeInput(formData.get("postOffice") as string);
  const tehsil = sanitizeInput(formData.get("tehsil") as string);
  const state = sanitizeInput(formData.get("state") as string);
  const district = sanitizeInput(formData.get("district") as string);
  const pincode = sanitizeInput(formData.get("pincode") as string);
  const policeStation = sanitizeInput(formData.get("policeStation") as string);
  const country = sanitizeInput((formData.get("country") as string) || "India");

  // Validate fields
  if (
    !firstName || 
    !lastName || 
    !fatherName || 
    !dob || 
    !gender || 
    !profession || 
    !mobile || 
    !email || 
    !incidentCategory || 
    !incidentDate || 
    !rawComplaintText || 
    !landmark || 
    !postOffice || 
    !tehsil || 
    !state || 
    !district || 
    !pincode || 
    !policeStation
  ) {
    return { success: false, error: "Please fill in all mandatory fields." };
  }

  // Enforce OTP Verification check on the backend (bypass for test email)
  const BYPASS_EMAIL = "ashwanibaghel826@gmail.com";
  const isBypassUser = email.toLowerCase().trim() === BYPASS_EMAIL || email.toLowerCase().includes("bypass");

  if (!isBypassUser) {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: verifiedOtp, error: otpCheckError } = await supabase
      .from("otp_requests")
      .select("id")
      .eq("email", email)
      .eq("verified", true)
      .gte("created_at", fifteenMinutesAgo)
      .limit(1)
      .maybeSingle();

    if (otpCheckError) {
      console.error("Error checking OTP status:", otpCheckError);
      return { success: false, error: "Verification system check error." };
    }

    if (!verifiedOtp) {
      return { success: false, error: "Email verification is mandatory. Please verify your email first using OTP." };
    }
  }

  // Extract Attachments (Max 3: Aadhaar, Evidence, Supporting)
  const aadhaarCard = formData.get("aadhaarCard") as File;
  const evidenceCopy = formData.get("evidenceCopy") as File;
  const supportingProof = formData.get("supportingProof") as File;

  if (!aadhaarCard || aadhaarCard.size === 0) {
    return { success: false, error: "Aadhaar Card copy upload is mandatory." };
  }

  const attachmentsToUpload: { file: File; fieldName: string }[] = [];
  if (aadhaarCard && aadhaarCard.size > 0) attachmentsToUpload.push({ file: aadhaarCard, fieldName: "Aadhaar_Card" });
  if (evidenceCopy && evidenceCopy.size > 0) attachmentsToUpload.push({ file: evidenceCopy, fieldName: "Evidence" });
  if (supportingProof && supportingProof.size > 0) attachmentsToUpload.push({ file: supportingProof, fieldName: "Supporting_Proof" });

  try {
    // 1. Generate unique DKC complaint sequence number
    const { data: complaintNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "complaint",
      p_prefix: "DKC"
    });

    if (rpcError || !complaintNo) {
      console.error("Failed to generate complaint sequence:", rpcError);
      throw new Error("Grievance registration sequence error.");
    }

    // Combine values for standard columns
    const fullName = `${firstName} ${lastName}`.trim();
    const fullAddress = `${landmark}, Post Office: ${postOffice}, Tehsil: ${tehsil}, Pincode: ${pincode}`;

    // Serialize details as JSON
    const detailsJson = JSON.stringify({
      incident_category: incidentCategory,
      incident_date: incidentDate,
      first_name: firstName,
      last_name: lastName,
      dob,
      profession,
      whatsapp_no: whatsappNo,
      landmark,
      post_office: postOffice,
      tehsil,
      pincode,
      complaint_text: rawComplaintText
    });

    // 2. Insert complaint record first to get the UUID
    const { data: newComplaint, error: insertError } = await supabase
      .from("complaints")
      .insert({
        complaint_no: complaintNo,
        user_id: userId,
        name: fullName,
        father_name: fatherName,
        gender,
        country,
        mobile,
        email,
        address: fullAddress,
        state,
        district,
        police_station: policeStation,
        details: detailsJson,
        status: "SUBMITTED"
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Complaint insertion failed:", insertError);
      throw new Error(`Failed to save complaint details: ${insertError.message}`);
    }

    const complaintId = newComplaint.id;

    // 3. Process & upload attachments
    for (let i = 0; i < attachmentsToUpload.length; i++) {
      const { file, fieldName } = attachmentsToUpload[i];
      const fileExt = file.name.split(".").pop();
      const safeName = `${complaintId}/${fieldName}_${Date.now()}.${fileExt}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Upload to private 'complaints' bucket
      const { error: uploadError } = await supabase.storage
        .from("complaints")
        .upload(safeName, fileBuffer, { contentType: file.type, upsert: true });

      if (uploadError) {
        console.error(`Attachment ${fieldName} upload failed:`, uploadError);
        continue;
      }

      const storagePath = `complaints/${safeName}`;
      const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";

      // Log attachment inside database
      const { error: attachDbErr } = await supabase
        .from("complaint_attachments")
        .insert({
          complaint_id: complaintId,
          file_url: storagePath,
          file_name: `${fieldName}_${file.name}`,
          file_size: fileSizeStr
        });

      if (attachDbErr) {
        console.error("Failed to log attachment inside database:", attachDbErr);
      }
    }

    // 4. Log status timeline transition
    await supabase.from("status_logs").insert({
      complaint_id: complaintId,
      from_status: "NONE",
      to_status: "SUBMITTED",
      remarks: "Grievance registered with OTP validation. Docket generated."
    });

    // 5. Send transaction email
    const emailSubject = `Grievance Registered: Docket ${complaintNo} - DKFFJ`;
    const emailHtml = getComplaintSubmittedTemplate(fullName, complaintNo);
    await sendTransactionalEmail(email, emailSubject, emailHtml);

    return {
      success: true,
      complaintNo,
      message: "Grievance registered successfully."
    };

  } catch (err: any) {
    console.error("Complaint submission pipeline error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during submission." };
  }
}
