"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getAppreciationVerificationTemplate, getAppreciationReceiptTemplate } from "@/services/email/templates";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sanitizeInput } from "@/lib/sanitize";
import { getPricingSettings } from "@/lib/portalSettings";
import { checkReferralEligibility } from "@/app/apply/actions";

// 1. Generate and Send OTP
export async function sendAppreciationOtp(mobile: string, email: string) {
  try {
    if (!mobile || !email) {
      return { success: false, error: "Mobile number and Email are required." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const cleanMobile = mobile.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins expiry

    // Insert OTP request into DB
    const { error } = await supabase
      .from("otp_requests")
      .insert({
        mobile: cleanMobile,
        email: cleanEmail,
        otp_code: code,
        expires_at: expiresAt,
        verified: false
      });

    if (error) {
      console.error("Error saving OTP request:", error);
      return { success: false, error: "Failed to generate OTP. Please try again." };
    }

    // Send Email with OTP
    const subject = "Verification OTP - DKFFJ Appreciation Application";
    const htmlContent = getAppreciationVerificationTemplate(code);
    const emailRes = await sendTransactionalEmail(cleanEmail, subject, htmlContent);

    if (!emailRes.success) {
      console.error("Resend email failed:", emailRes.error);
      return { success: false, error: `Email delivery failed: ${emailRes.error}.` };
    }

    console.log(`[APPRECIATION OTP SENT] To Mobile: ${cleanMobile}, Email: ${cleanEmail} -> CODE: ${code}`);

    if (emailRes.mock) {
      return {
        success: true,
        message: `[MOCK MODE] OTP: ${code} (Vercel is not reading RESEND_API_KEY).`
      };
    }

    return { success: true, message: "OTP sent successfully. Please check your email." };
  } catch (err: any) {
    console.error("sendAppreciationOtp exception:", err);
    return { success: false, error: err?.message || "Failed to send OTP due to a server error." };
  }
}

// 2. Verify OTP
export async function verifyAppreciationOtp(mobile: string, code: string, email?: string) {
  try {
    if (!mobile || !code) {
      return { success: false, error: "Mobile and OTP code are required." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const now = new Date().toISOString();

    const cleanMobile = mobile.trim();
    const rawMobile = cleanMobile.replace(/\D/g, "").slice(-10);
    const cleanCode = code.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : "";

    // Fetch active unverified OTP request for this mobile (matching full or 10-digit raw mobile or email)
    let query = supabase
      .from("otp_requests")
      .select("id, otp_code, expires_at, verified")
      .eq("otp_code", cleanCode)
      .eq("verified", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1);

    if (cleanEmail) {
      query = query.or(`mobile.eq.${cleanMobile},mobile.eq.${rawMobile},email.eq.${cleanEmail}`);
    } else {
      query = query.or(`mobile.eq.${cleanMobile},mobile.eq.${rawMobile}`);
    }

    const { data, error } = await query.maybeSingle();

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
      return { success: false, error: "Verification failed. Please try again." };
    }

    return { success: true, message: "OTP verified successfully." };
  } catch (err: any) {
    console.error("verifyAppreciationOtp exception:", err);
    return { success: false, error: err?.message || "Verification failed due to a server error." };
  }
}

// 3. Submit Appreciation Application
export async function submitAppreciationApplication(prevData: any, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract authentication inputs
  const email = sanitizeInput(formData.get("email") as string);
  const mobile = sanitizeInput(formData.get("mobile") as string);
  const password = formData.get("password") as string;
  const fullName = sanitizeInput(formData.get("fullName") as string);
  const otpCode = sanitizeInput(formData.get("otpCode") as string);

  // OTP must be current and can authorize only one submission.
  {
    const rawMobile = mobile.replace(/\D/g, "").slice(-10);
    const cleanEmail = email.toLowerCase().trim();

    let otpQuery = supabase
      .from("otp_requests")
      .select("id")
      .eq("verified", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpCode && otpCode.trim()) {
      otpQuery = otpQuery.eq("otp_code", otpCode.trim());
    }

    if (cleanEmail) {
      otpQuery = otpQuery.or(`mobile.eq.${mobile},mobile.eq.${rawMobile},email.eq.${cleanEmail}`);
    } else {
      otpQuery = otpQuery.or(`mobile.eq.${mobile},mobile.eq.${rawMobile}`);
    }

    const { data: verifiedOtp, error: otpCheckError } = await otpQuery.maybeSingle();

    if (otpCheckError || !verifiedOtp) {
      return { success: false, error: "Please verify your mobile/email using OTP first." };
    }

    const { data: consumedOtp, error: consumeOtpError } = await supabase
      .from("otp_requests")
      .update({ verified: false })
      .eq("id", verifiedOtp.id)
      .eq("verified", true)
      .select("id");
    if (consumeOtpError || !consumedOtp || consumedOtp.length !== 1) {
      return { success: false, error: "OTP has already been used. Please request a new OTP." };
    }
  }

  // Handle Authentication / User Account Creation
  let userId = "";
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    userId = user.id;
  } else {
    // Auto-generate password if not provided to seamlessly create account
    const accountPassword = password || ("DKM@" + Math.random().toString(36).substring(2, 10) + "!" + Math.floor(100 + Math.random() * 900));

    try {
      const { data: createdUserId, error: dbRegError } = await supabase.rpc("create_auth_user", {
        p_email: email,
        p_password: accountPassword,
        p_full_name: fullName
      });

      if (dbRegError || !createdUserId) {
        const { data: existingApp } = await supabase.from("appreciation_applications").select("user_id").eq("email", email).maybeSingle();
        userId = existingApp?.user_id || "";
      } else {
        userId = createdUserId as string;
      }
    } catch (err: any) {
      console.error("Auth registration exception:", err);
      userId = "";
    }
  }

  // Extract Form Fields
  const fatherName = sanitizeInput(formData.get("fatherName") as string);
  const gender = sanitizeInput(formData.get("gender") as string);
  const dob = sanitizeInput(formData.get("dob") as string);
  const country = sanitizeInput((formData.get("country") as string) || "India");
  const whatsapp = sanitizeInput(formData.get("whatsapp") as string);
  const address = sanitizeInput(formData.get("address") as string);
  const district = sanitizeInput(formData.get("district") as string);
  const state = sanitizeInput(formData.get("state") as string);
  const pincode = sanitizeInput(formData.get("pincode") as string);
  const socialWorkField = sanitizeInput(formData.get("socialWorkField") as string);
  const description = sanitizeInput(formData.get("description") as string);

  // Extract Upload Files / Pre-uploaded Storage URLs
  let photoUrl = sanitizeInput((formData.get("photoUrl") as string) || "");
  let idProofUrl = sanitizeInput((formData.get("idProofUrl") as string) || "");
  let achievementProofUrl: string | null = sanitizeInput((formData.get("achievementProofUrl") as string) || "");

  try {
    // If not pre-uploaded from browser, handle server-side upload fallback
    if (!photoUrl || !idProofUrl) {
      const photo = formData.get("photo") as File;
      const idProof = formData.get("idProof") as File;
      const achievementProof = formData.get("achievementProof") as File;

      if (!photo || photo.size === 0 || !idProof || idProof.size === 0) {
        return { success: false, error: "All required files (Photo, ID Proof) must be uploaded." };
      }

      const photoExt = photo.name.split(".").pop();
      const idProofExt = idProof.name.split(".").pop();
      const photoName = `${userId}/photo_${Date.now()}.${photoExt}`;
      const idProofName = `${userId}/idproof_${Date.now()}.${idProofExt}`;

      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const idProofBuffer = Buffer.from(await idProof.arrayBuffer());

      // Upload to 'photos' bucket (public)
      const { error: photoErr } = await supabase.storage
        .from("photos")
        .upload(photoName, photoBuffer, { contentType: photo.type, upsert: true });

      if (photoErr) throw new Error(`Photo upload failed: ${photoErr.message}`);

      const { data: photoUrlData } = supabase.storage.from("photos").getPublicUrl(photoName);
      photoUrl = photoUrlData.publicUrl;

      // Upload to 'aadhaar' bucket (private, secure for ID proofs)
      const { error: idProofErr } = await supabase.storage
        .from("aadhaar")
        .upload(idProofName, idProofBuffer, { contentType: idProof.type, upsert: true });

      if (idProofErr) throw new Error(`ID Proof upload failed: ${idProofErr.message}`);
      idProofUrl = `aadhaar/${idProofName}`;

      // Upload achievement proof if present
      if (achievementProof && achievementProof.size > 0) {
        const achievementExt = achievementProof.name.split(".").pop();
        const achievementName = `${userId}/achievement_${Date.now()}.${achievementExt}`;
        const achievementBuffer = Buffer.from(await achievementProof.arrayBuffer());

        const { error: achievementErr } = await supabase.storage
          .from("aadhaar")
          .upload(achievementName, achievementBuffer, { contentType: achievementProof.type, upsert: true });

        if (achievementErr) throw new Error(`Achievement Proof upload failed: ${achievementErr.message}`);
        achievementProofUrl = `aadhaar/${achievementName}`;
      }
    }

    // 2. Generate temporary Draft Application Number (official sequence ID assigned on payment completion)
    const appNo = `DKFFJ/A/DRAFT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Determine user_id (null if user is not authenticated or account creation didn't return a valid user)
    const validUserId = (userId && userId.trim() !== "" && userId.trim() !== "null")
      ? userId.trim()
      : null;

    // Extract Referral Code if provided
    const joiningType = sanitizeInput((formData.get("joiningType") as string) || "direct");
    const referralCode = sanitizeInput((formData.get("referralCode") as string) || "");

    let referredByMemberId: string | null = null;
    if (joiningType === "referred" && referralCode.trim()) {
      const refRes = await checkReferralEligibility(referralCode.trim(), validUserId, email, mobile);
      if (!refRes.success) {
        return { success: false, error: refRes.error };
      }
      referredByMemberId = refRes.referrerId || null;
    }

    // 3. Save application details to DB
    const insertPayload: any = {
      application_no: appNo,
      full_name: fullName,
      email,
      mobile,
      address,
      country: country || "India",
      state,
      district,
      pincode,
      social_work_field: socialWorkField,
      description,
      photo_url: photoUrl,
      id_proof_url: idProofUrl,
      achievement_proof_url: achievementProofUrl,
      status: "PENDING"
    };

    if (validUserId) {
      insertPayload.user_id = validUserId;
    }
    if (referredByMemberId) {
      insertPayload.referred_by_member_id = referredByMemberId;
    }

    let { data: newApplication, error: insertError } = await supabase
      .from("appreciation_applications")
      .insert(insertPayload)
      .select("id")
      .single();

    // Fallback: If insert fails due to FK or user_id constraint, try without user_id
    if (insertError && insertPayload.user_id) {
      console.warn("Retrying appreciation application insert without user_id due to:", insertError.message);
      delete insertPayload.user_id;
      const retryRes = await supabase
        .from("appreciation_applications")
        .insert(insertPayload)
        .select("id")
        .single();
      newApplication = retryRes.data;
      insertError = retryRes.error;
    }

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    const applicationId = newApplication.id;

    // 4. Create Pending Payment Log with dynamic fee from Portal Settings (Special ₹1 test fee for admin emails)
    const pricingSettings = await getPricingSettings();
    let amount = pricingSettings.appreciationFee;

    const tempTxnId = "APR-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount,
        transaction_id: tempTxnId,
        gateway: "PHONEPE",
        status: "PENDING",
        appreciation_id: applicationId
      });

    if (paymentError) {
      console.error("Database payment logging error:", paymentError);
      throw new Error(`Failed to initialize payment tracking: ${paymentError.message}`);
    }

    console.info("[APPRECIATION_PAYMENT_CREATED]", {
      applicationId,
      applicationNo: appNo,
      orderId: tempTxnId,
      amount,
      paymentStatus: "PENDING"
    });

    // 5. Generate Payment Redirect Link
    const checkoutUrl = await paymentServiceInstance.processPayment({
      orderId: tempTxnId,
      amount,
      currency: "INR",
      customerEmail: email,
      customerMobile: mobile
    });

    // 6. Return redirect URL without email
    return {
      success: true,
      applicationNo: appNo,
      checkoutUrl,
      message: "Application submitted successfully. Redirecting to payment..."
    };

  } catch (err: any) {
    console.error("submitAppreciationApplication error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
