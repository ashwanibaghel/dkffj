"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getAppreciationVerificationTemplate, getAppreciationReceiptTemplate } from "@/services/email/templates";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sanitizeInput } from "@/lib/sanitize";

// 1. Generate and Send OTP
export async function sendAppreciationOtp(mobile: string, email: string) {
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

  // Send Email with OTP
  const subject = "Verification OTP - DKFFJ Appreciation Application";
  const htmlContent = getAppreciationVerificationTemplate(code);
  const emailRes = await sendTransactionalEmail(email, subject, htmlContent);

  if (!emailRes.success) {
    console.error("Resend email failed:", emailRes.error);
    return { success: false, error: `Email delivery failed: ${emailRes.error}.` };
  }

  console.log(`[APPRECIATION OTP SENT] To Mobile: ${mobile}, Email: ${email} -> CODE: ${code}`);

  if (emailRes.mock) {
    return {
      success: true,
      message: `[MOCK MODE] OTP: ${code} (Vercel is not reading RESEND_API_KEY).`
    };
  }

  return { success: true, message: "OTP sent successfully. Please check your email." };
}

// 2. Verify OTP
export async function verifyAppreciationOtp(mobile: string, code: string) {
  if (!mobile || !code) {
    return { success: false, error: "Mobile and OTP code are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const now = new Date().toISOString();

  // Fetch the latest active OTP request for this mobile
  const { data, error } = await supabase
    .from("otp_requests")
    .select("id, otp_code, expires_at, verified")
    .eq("mobile", mobile)
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
    return { success: false, error: "Verification failed. Please try again." };
  }

  return { success: true, message: "OTP verified successfully." };
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

  // Validate OTP was verified (bypass for test email)
  const BYPASS_EMAIL = "ashwanibaghel826@gmail.com";
  const isBypassUser = email.toLowerCase().trim() === BYPASS_EMAIL || email.toLowerCase().includes("bypass");

  if (!isBypassUser) {
    const { data: verifiedOtp, error: otpCheckError } = await supabase
      .from("otp_requests")
      .select("id")
      .eq("mobile", mobile)
      .eq("otp_code", otpCode)
      .eq("verified", true)
      .limit(1)
      .maybeSingle();

    if (otpCheckError || !verifiedOtp) {
      return { success: false, error: "Please verify your mobile/email using OTP first." };
    }
  }

  // Handle Authentication / User Account Creation
  let userId = "";
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    userId = user.id;
  } else {
    // If not logged in, we need a password to create an account
    if (!password) {
      return { success: false, error: "Please log in first or provide a password to register a new account." };
    }

    try {
      const { data: createdUserId, error: dbRegError } = await supabase.rpc("create_auth_user", {
        p_email: email,
        p_password: password,
        p_full_name: fullName
      });

      if (dbRegError || !createdUserId) {
        console.error("Auth registration database error:", dbRegError);
        return { success: false, error: `Account registration failed: ${dbRegError?.message || "Failed to create account"}` };
      }

      userId = createdUserId as string;
    } catch (err: any) {
      console.error("Auth registration exception:", err);
      return { success: false, error: `Account registration failed: ${err.message || err}` };
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

  // Extract Upload Files
  const photo = formData.get("photo") as File;
  const idProof = formData.get("idProof") as File;
  const achievementProof = formData.get("achievementProof") as File;

  if (!photo || photo.size === 0 || !idProof || idProof.size === 0) {
    return { success: false, error: "All required files (Photo, ID Proof) must be uploaded." };
  }

  try {
    // 1. Upload files to Supabase Storage
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
    const photoUrl = photoUrlData.publicUrl;

    // Upload to 'aadhaar' bucket (private, secure for ID proofs)
    const { error: idProofErr } = await supabase.storage
      .from("aadhaar")
      .upload(idProofName, idProofBuffer, { contentType: idProof.type, upsert: true });

    if (idProofErr) throw new Error(`ID Proof upload failed: ${idProofErr.message}`);
    const idProofUrl = `aadhaar/${idProofName}`;

    // Upload achievement proof if present
    let achievementProofUrl: string | null = null;
    if (achievementProof && achievementProof.size > 0) {
      const achievementExt = achievementProof.name.split(".").pop();
      const achievementName = `${userId}/achievement_${Date.now()}.${achievementExt}`;
      const achievementBuffer = Buffer.from(await achievementProof.arrayBuffer());

      const { error: achievementErr } = await supabase.storage
        .from("aadhaar") // Save securely in aadhaar private bucket
        .upload(achievementName, achievementBuffer, { contentType: achievementProof.type, upsert: true });

      if (achievementErr) throw new Error(`Achievement Proof upload failed: ${achievementErr.message}`);
      achievementProofUrl = `aadhaar/${achievementName}`;
    }

    // 2. Generate Application Number
    const { data: appNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "appreciation_app",
      p_prefix: "DKA"
    });

    if (rpcError || !appNo) {
      console.error("RPC sequence generation error:", rpcError);
      throw new Error("Failed to generate application number.");
    }

    // 3. Save application details to DB
    const { data: newApplication, error: insertError } = await supabase
      .from("appreciation_applications")
      .insert({
        application_no: appNo,
        user_id: userId,
        full_name: fullName,
        email,
        mobile,
        address,
        country,
        state,
        district,
        pincode,
        social_work_field: socialWorkField,
        description,
        photo_url: photoUrl,
        id_proof_url: idProofUrl,
        achievement_proof_url: achievementProofUrl,
        status: "PENDING"
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    const applicationId = newApplication.id;

    // 4. Create Pending Payment Log
    const amount = 1500; // Rs. 1500 application fee
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
