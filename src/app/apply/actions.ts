"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipVerificationTemplate, getMembershipReceiptTemplate } from "@/services/email/templates";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sanitizeInput } from "@/lib/sanitize";

// 1. Generate and Send OTP
export async function sendMembershipOtp(mobile: string, email: string) {
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
  const subject = "Verification OTP - DKFFJ Portal";
  const htmlContent = getMembershipVerificationTemplate(code);
  const emailRes = await sendTransactionalEmail(email, subject, htmlContent);

  if (!emailRes.success) {
    console.error("Resend email failed:", emailRes.error);
    return { success: false, error: `Email delivery failed: ${emailRes.error}. If using a free Resend account, make sure RESEND_FROM_EMAIL environment variable is set to onboarding@resend.dev on Vercel.` };
  }

  // Log to console for local developer debugging/testing
  console.log(`[OTP SENT] To Mobile: ${mobile}, Email: ${email} -> CODE: ${code}`);

  if (emailRes.mock) {
    return {
      success: true,
      message: `[MOCK MODE] OTP: ${code} (Vercel is not reading RESEND_API_KEY).`
    };
  }

  return { success: true, message: "OTP sent successfully. Please check your email/mobile." };
}

// 2. Verify OTP
export async function verifyMembershipOtp(mobile: string, code: string) {
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

/**
 * Validates a referral code (membership_no) and returns the referrer's UUID if eligible.
 * Prevents self-referral using userId, email, and mobile checks.
 */
export async function checkReferralEligibility(
  referralCode: string,
  applicantUserId: string | null,
  applicantEmail: string,
  applicantMobile: string
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const cleanCode = referralCode.trim().toUpperCase();

  // 1. Fetch referrer membership details
  const { data: referrer, error } = await supabase
    .from("memberships")
    .select("id, status, user_id, email, mobile, membership_no")
    .eq("membership_no", cleanCode)
    .maybeSingle();

  if (error || !referrer) {
    return { success: false, error: "The Referral Member ID entered is invalid." };
  }

  // 2. Check if referrer is APPROVED
  // (Isolating status check so additional expiry/suspension rules can be added here later)
  if (referrer.status !== "APPROVED") {
    return { success: false, error: "The Referral Member ID entered is not an active approved member." };
  }

  // 3. Self-referral prevention (authenticated user checks - hard block)
  if (applicantUserId && referrer.user_id === applicantUserId) {
    return { success: false, error: "You cannot use your own Membership ID as a referral." };
  }

  // 4. Soft warning check (unauthenticated contact-based matches - do NOT hard block)
  const cleanAppEmail = applicantEmail.trim().toLowerCase();
  const cleanAppMobile = applicantMobile.trim();
  const cleanRefEmail = referrer.email.trim().toLowerCase();
  const cleanRefMobile = referrer.mobile.trim();

  const isContactMatch = cleanRefEmail === cleanAppEmail || cleanRefMobile === cleanAppMobile;

  return { success: true, referrerId: referrer.id, isContactMatch };
}

// 3. Submit Membership Application
export async function submitMembershipApplication(prevData: any, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract authentication inputs
  const email = sanitizeInput(formData.get("email") as string);
  const mobile = sanitizeInput(formData.get("mobile") as string);
  const password = formData.get("password") as string;
  const fullName = sanitizeInput(formData.get("fullName") as string);
  const otpCode = sanitizeInput(formData.get("otpCode") as string);
  const referralCode = sanitizeInput(formData.get("referralCode") as string || "");

  // Validate OTP was verified
  const now = new Date().toISOString();
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

    // Sign up the user via database RPC to bypass SMTP rate limit
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

  // Validate Referral Code if provided (Direct joining has no code)
  let referredByMemberId: string | null = null;
  let remarksPayload: string | null = null;
  if (referralCode) {
    const referralRes = await checkReferralEligibility(referralCode, userId || null, email, mobile);
    if (!referralRes.success) {
      return { success: false, error: referralRes.error };
    }
    referredByMemberId = referralRes.referrerId || null;
    if (referralRes.isContactMatch) {
      remarksPayload = "FLAGGED: Referral contact details (email or mobile) match applicant details.";
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
  const education = sanitizeInput(formData.get("education") as string);
  const profession = sanitizeInput(formData.get("profession") as string);
  const workingArea = sanitizeInput(formData.get("workingArea") as string);
  const designation = sanitizeInput(formData.get("designation") as string);
  const policeStation = sanitizeInput(formData.get("policeStation") as string);

  // Extract Upload Files
  const photo = formData.get("photo") as File;
  const aadhaar = formData.get("aadhaar") as File;
  const signature = formData.get("signature") as File;

  if (!photo || photo.size === 0 || !aadhaar || aadhaar.size === 0 || !signature || signature.size === 0) {
    return { success: false, error: "All required files (Photo, Aadhaar Card, Signature) must be uploaded." };
  }

  try {
    // 1. Upload files to Supabase Storage
    const photoExt = photo.name.split(".").pop();
    const aadhaarExt = aadhaar.name.split(".").pop();
    const signatureExt = signature.name.split(".").pop();

    const photoName = `${userId}/photo_${Date.now()}.${photoExt}`;
    const aadhaarName = `${userId}/aadhaar_${Date.now()}.${aadhaarExt}`;
    const signatureName = `${userId}/signature_${Date.now()}.${signatureExt}`;

    // Convert Files to ArrayBuffers -> Buffers
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const aadhaarBuffer = Buffer.from(await aadhaar.arrayBuffer());
    const signatureBuffer = Buffer.from(await signature.arrayBuffer());

    // Upload to 'photos' bucket (public)
    const { data: photoUpload, error: photoErr } = await supabase.storage
      .from("photos")
      .upload(photoName, photoBuffer, { contentType: photo.type, upsert: true });

    if (photoErr) throw new Error(`Photo upload failed: ${photoErr.message}`);

    // Get public URL for photo
    const { data: photoUrlData } = supabase.storage.from("photos").getPublicUrl(photoName);
    const photoUrl = photoUrlData.publicUrl;

    // Upload to 'aadhaar' bucket (private)
    const { error: aadhaarErr } = await supabase.storage
      .from("aadhaar")
      .upload(aadhaarName, aadhaarBuffer, { contentType: aadhaar.type, upsert: true });

    if (aadhaarErr) throw new Error(`Aadhaar upload failed: ${aadhaarErr.message}`);
    const aadhaarUrl = `aadhaar/${aadhaarName}`; // Save private storage path

    // Upload to 'signatures' bucket (private)
    const { error: signatureErr } = await supabase.storage
      .from("signatures")
      .upload(signatureName, signatureBuffer, { contentType: signature.type, upsert: true });

    if (signatureErr) throw new Error(`Signature upload failed: ${signatureErr.message}`);
    const signatureUrl = `signatures/${signatureName}`; // Save private storage path

    // 2. Generate Acknowledgement Number using SQL Stored Procedure
    const { data: ackNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "membership_ack",
      p_prefix: "ACK"
    });

    if (rpcError) {
      console.error("RPC sequence generation error:", rpcError);
      throw new Error("Failed to generate acknowledgement number.");
    }

    // 3. Save application details to DB
    const { data: membership, error: dbError } = await supabase
      .from("memberships")
      .select("id")
      .eq("ack_no", ackNo)
      .maybeSingle();

    if (dbError) throw dbError;

    // Insert new membership
      const { data: newMembership, error: insertError } = await supabase
        .from("memberships")
        .insert({
          ack_no: ackNo,
          user_id: userId,
          full_name: fullName,
          father_name: fatherName,
          gender,
          dob,
          mobile,
          whatsapp,
          email,
          address,
          country,
          district,
          state,
          pincode,
          education,
          profession,
          working_area: workingArea,
          designation,
          police_station: policeStation,
          photo_url: photoUrl,
          aadhaar_url: aadhaarUrl,
          signature_url: signatureUrl,
          status: "PENDING",
          referred_by_member_id: referredByMemberId,
          remarks: remarksPayload
        })
        .select("id")
        .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    const membershipId = newMembership.id;

    // 4. Create Pending Payment Log
    const amount = Number(process.env.MEMBERSHIP_FEE || 1000.0);
    const tempTxnId = "MBR-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount,
        transaction_id: tempTxnId,
        gateway: "PHONEPE",
        status: "PENDING",
        membership_id: membershipId
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

    // 6. Send initial acknowledgement email receipt (pending payment verification)
    const receiptSubject = "Membership Application Received (Awaiting Payment) - DKFFJ";
    const receiptHtml = getMembershipReceiptTemplate(fullName, ackNo, amount);
    await sendTransactionalEmail(email, receiptSubject, receiptHtml);

    return {
      success: true,
      ackNo,
      checkoutUrl,
      message: "Application submitted. Redirecting to payment gateway..."
    };

  } catch (err: any) {
    console.error("Submission pipeline error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during submission." };
  }
}
