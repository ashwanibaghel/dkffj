"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { normalizeMembershipNumber, toLegacyMembershipNumber } from "@/lib/membershipNumber";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipVerificationTemplate, getMembershipReceiptTemplate } from "@/services/email/templates";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sanitizeInput } from "@/lib/sanitize";
import { autoDetectMembershipLevel, getFeeForLevel } from "@/lib/data/membershipTiers";
import { getPricingSettings } from "@/lib/portalSettings";

// 1. Generate and Send OTP
export async function sendMembershipOtp(mobile: string, email: string) {
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
    const subject = "Verification OTP - DKFFJ Portal";
    const htmlContent = getMembershipVerificationTemplate(code);
    const emailRes = await sendTransactionalEmail(cleanEmail, subject, htmlContent);

    if (!emailRes.success) {
      console.error("Resend email failed:", emailRes.error);
      return { success: false, error: `OTP bhejne mein samasya aai. Kuch der baad dobara koshish karein ya support se sampark karein.` };
    }

    // Log to console for developer debugging/testing
    console.log(`[OTP SENT] To Mobile: ${cleanMobile}, Email: ${cleanEmail} -> CODE: ${code}`);

    if (emailRes.mock) {
      return {
        success: true,
        message: `[MOCK MODE] OTP: ${code} (Vercel is not reading RESEND_API_KEY).`
      };
    }

    return { success: true, message: "OTP sent successfully. Please check your email/mobile." };
  } catch (err: any) {
    console.error("sendMembershipOtp exception:", err);
    return { success: false, error: err?.message || "Failed to send OTP due to a server error. Please try again." };
  }
}

// 2. Verify OTP
export async function verifyMembershipOtp(mobile: string, code: string, email?: string) {
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
    console.error("verifyMembershipOtp exception:", err);
    return { success: false, error: err?.message || "Verification failed due to a server error." };
  }
}

/**
 * Validates a referral code (membership_no) and returns the referrer's UUID if eligible.
 * Prevents self-referral using userId, email, and mobile checks.
 */
export async function checkReferralEligibility(
  referralCode: string,
  applicantUserId: string | null = null,
  applicantEmail: string = "",
  applicantMobile: string = ""
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!referralCode || !referralCode.trim()) {
    return { success: false, error: "Please enter a Referral Member ID." };
  }

  const rawCode = referralCode.trim();
  if (!/^[A-Za-z0-9/-]{3,100}$/.test(rawCode)) {
    return { success: false, error: "Referral Member ID format is invalid." };
  }

  // Accept the corrected public format for older records too, but only match
  // exact stored values. This avoids turning a referral lookup into a partial
  // search while the one-time database cleanup is being rolled out.
  const normalizedCode = normalizeMembershipNumber(rawCode);
  const memberCodes = [...new Set([rawCode, normalizedCode, toLegacyMembershipNumber(normalizedCode)])];
  const columns = "id, status, user_id, email, mobile, membership_no, ack_no, full_name, designation";
  const [{ data: membershipMatches, error: membershipError }, { data: ackMatches, error: ackError }] = await Promise.all([
    supabase.from("memberships").select(columns).in("membership_no", memberCodes).limit(2),
    supabase.from("memberships").select(columns).eq("ack_no", rawCode).limit(2),
  ]);
  const matches = [...(membershipMatches || []), ...(ackMatches || [])];
  const error = membershipError || ackError;

  if (error || !matches || matches.length === 0) {
    return {
      success: false,
      error: `The Referral Member ID ("${rawCode}") is invalid or not found. Please check with your referrer or choose Direct Joining.`
    };
  }

  // Prefer approved referrer
  const referrer = matches.find((m) => m.status === "APPROVED") || matches[0];

  if (referrer.status !== "APPROVED") {
    return {
      success: false,
      error: `Referrer "${referrer.full_name}" is currently pending or inactive.`
    };
  }

  // Self-referral check
  if (applicantUserId && referrer.user_id === applicantUserId) {
    return { success: false, error: "You cannot use your own Membership ID as a referral." };
  }

  const cleanAppEmail = (applicantEmail || "").trim().toLowerCase();
  const cleanAppMobile = (applicantMobile || "").trim();
  const cleanRefEmail = (referrer.email || "").trim().toLowerCase();
  const cleanRefMobile = (referrer.mobile || "").trim();

  const isContactMatch = Boolean(
    (cleanAppEmail && cleanRefEmail && cleanRefEmail === cleanAppEmail) ||
    (cleanAppMobile && cleanRefMobile && cleanRefMobile === cleanAppMobile)
  );

  if (isContactMatch) {
    return { success: false, error: "You cannot use a referral ID linked to the same email address or mobile number." };
  }

  return {
    success: true,
    referrerId: referrer.id,
    referrerName: referrer.full_name,
    referrerCode: normalizeMembershipNumber(referrer.membership_no) || referrer.ack_no,
    referrerDesignation: referrer.designation,
    isContactMatch
  };
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
    // If not logged in, auto-generate password to seamlessly create account
    const accountPassword = password || ("DKM@" + Math.random().toString(36).substring(2, 10) + "!" + Math.floor(100 + Math.random() * 900));

    // Sign up the user via database RPC to bypass SMTP rate limit
    try {
      const { data: createdUserId, error: dbRegError } = await supabase.rpc("create_auth_user", {
        p_email: email,
        p_password: accountPassword,
        p_full_name: fullName
      });

      if (dbRegError || !createdUserId) {
        // If user already exists, try fetching user id from memberships table
        const { data: existingMbr } = await supabase.from("memberships").select("user_id").eq("email", email).maybeSingle();
        userId = existingMbr?.user_id || "";
      } else {
        userId = createdUserId as string;
      }
    } catch (err: any) {
      console.error("Auth registration exception:", err);
      userId = "";
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

  // Accept pre-uploaded file URLs (browser uploaded directly to Supabase Storage)
  const photoUrl = sanitizeInput(formData.get("photoUrl") as string);
  const aadhaarUrl = sanitizeInput(formData.get("aadhaarUrl") as string);
  const signatureUrl = sanitizeInput(formData.get("signatureUrl") as string);

  if (!photoUrl || !aadhaarUrl || !signatureUrl) {
    return { success: false, error: "Document upload failed or incomplete. Please re-upload all files." };
  }

  try {
    // 2. Generate Official Acknowledgement Number (DKF-2026-XXXXXX)
    const ackNo = `DKF-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Save application details to DB
    const { data: membership, error: dbError } = await supabase
      .from("memberships")
      .select("id")
      .eq("ack_no", ackNo)
      .maybeSingle();

    if (dbError) throw dbError;

    const validUserId = (userId && userId.trim() !== "" && userId.trim() !== "null") ? userId.trim() : null;

    const mbrPayload: any = {
      ack_no: ackNo,
      full_name: fullName,
      father_name: fatherName,
      gender,
      dob,
      mobile,
      whatsapp,
      email,
      address,
      country: country || "India",
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
      status: referredByMemberId ? "UNDER_REVIEW" : "PENDING",
      referred_by_member_id: referredByMemberId,
      remarks: remarksPayload
    };

    if (validUserId) {
      mbrPayload.user_id = validUserId;
    }

    let { data: newMembership, error: insertError } = await supabase
      .from("memberships")
      .insert(mbrPayload)
      .select("id")
      .single();

    if (insertError && mbrPayload.user_id) {
      console.warn("Retrying membership insert without user_id due to:", insertError.message);
      delete mbrPayload.user_id;
      const retryRes = await supabase
        .from("memberships")
        .insert(mbrPayload)
        .select("id")
        .single();
      newMembership = retryRes.data;
      insertError = retryRes.error;
    }

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    const membershipId = newMembership.id;

    // 4. Referral Payment Waiver (PhonePe is completely bypassed for referral code users)
    if (referredByMemberId) {
      const tempTxnId = "REF-BYPASS-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          amount: 0,
          transaction_id: tempTxnId,
          gateway: "REFERRAL_BYPASS",
          status: "COMPLETED",
          membership_id: membershipId
        });

      if (paymentError) {
        console.error("Database referral payment logging error:", paymentError);
      }

      return {
        success: true,
        isReferralBypass: true,
        ackNo,
        message: "Referral membership application registered successfully! Payment waived (₹0)."
      };
    }

    // 5. Direct / Non-referred Payment Flow with Exact Tier Amount
    const pricingSettings = await getPricingSettings();
    const levelKeyInput = sanitizeInput((formData.get("membershipLevel") as string) || "");
    const targetLevel = levelKeyInput || autoDetectMembershipLevel(designation, workingArea);
    const amount = getFeeForLevel(targetLevel, pricingSettings);

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

    // 6. Generate Payment Redirect Link with exact tier amount
    const checkoutUrl = await paymentServiceInstance.processPayment({
      orderId: tempTxnId,
      amount,
      currency: "INR",
      customerEmail: email,
      customerMobile: mobile
    });

    // 7. Return redirection URL without sending pending payment email
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
