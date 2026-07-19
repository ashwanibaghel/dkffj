"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sendTransactionalEmail } from "@/services/email/service";
import { getCourseRegistrationReceiptTemplate, getCourseVerificationTemplate } from "@/services/email/templates";

// 1. Fetch all active courses
export async function getActiveCourses() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return courses;
}

// 2. Register for a Course
export async function registerForCourse(prevData: any, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract Form Fields
  const courseId = formData.get("courseId") as string;
  const fullName = formData.get("fullName") as string;
  const mobile = formData.get("mobile") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const otpCode = formData.get("otpCode") as string;
  const fatherName = formData.get("fatherName") as string;
  const photo = formData.get("photo") as File | null;
  const workingSector = formData.get("workingSector") as string;
  const trainingCenter = formData.get("trainingCenter") as string;
  const experienceCert = formData.get("experienceCert") as File | null;
  const qualification = formData.get("qualification") as string;
  const dob = formData.get("dob") as string;
  const gender = formData.get("gender") as string;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const district = formData.get("district") as string;
  const qualificationDoc = formData.get("qualificationDoc") as File | null;
  const aadhaarDoc = formData.get("aadhaarDoc") as File | null;

  if (!courseId || !fullName || !mobile || !email || !fatherName || !photo || photo.size === 0 || !workingSector || !trainingCenter ||
      !qualification || !dob || !gender || !address || !state || !district || !qualificationDoc || qualificationDoc.size === 0 || !aadhaarDoc || aadhaarDoc.size === 0) {
    return { success: false, error: "Please fill in all registration fields, including Aadhaar Card and Qualification Documents." };
  }

  // 1. Get/Create User account
  let userId = "";
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    userId = user.id;
  } else {
    if (!password) {
      return { success: false, error: "Please sign in first or enter a password to register your academy account." };
    }
    // OTP bypass for test/dev email
    const BYPASS_EMAIL = "ashwanibaghel826@gmail.com";
    const isBypassUser = email.toLowerCase().trim() === BYPASS_EMAIL || email.toLowerCase().includes("bypass");

    if (!isBypassUser) {
      if (!otpCode) {
        return { success: false, error: "Verification OTP is required to verify your email." };
      }
      // Verify OTP has been verified for this mobile/email combination
      const { data: verifiedOtp, error: otpCheckError } = await supabase
        .from("otp_requests")
        .select("id")
        .eq("mobile", mobile)
        .eq("email", email)
        .eq("otp_code", otpCode)
        .eq("verified", true)
        .limit(1)
        .maybeSingle();

      if (otpCheckError || !verifiedOtp) {
        return { success: false, error: "Please verify your email address using OTP first before creating your account." };
      }
    }

    try {
      const { data: createdUserId, error: dbRegError } = await supabase.rpc("create_auth_user", {
        p_email: email,
        p_password: password,
        p_full_name: fullName
      });

      if (dbRegError || !createdUserId) {
        console.error("Auth academy registration database error:", dbRegError);
        return { success: false, error: `Account registration failed: ${dbRegError?.message || "Failed to create account"}` };
      }

      userId = createdUserId as string;
    } catch (err: any) {
      console.error("Auth academy registration exception:", err);
      return { success: false, error: `Account registration failed: ${err.message || err}` };
    }
  }

  // Upload Profile Photo to Supabase Storage
  let photoUrl = "";
  try {
    const photoExt = photo.name.split(".").pop() || "jpg";
    const photoName = `${userId}/photo_course_${Date.now()}.${photoExt}`;
    const photoBuffer = Buffer.from(await photo.arrayBuffer());

    const { data: photoUpload, error: photoErr } = await supabase.storage
      .from("photos")
      .upload(photoName, photoBuffer, { contentType: photo.type, upsert: true });

    if (photoErr) {
      console.error("Photo upload error:", photoErr);
      throw new Error(`Profile photo upload failed: ${photoErr.message}`);
    }

    const { data: photoUrlData } = supabase.storage.from("photos").getPublicUrl(photoName);
    photoUrl = photoUrlData.publicUrl;
  } catch (err: any) {
    console.error("Profile photo upload pipeline error:", err);
    return { success: false, error: err.message || "Failed to upload profile photo." };
  }

  // Upload Experience Certificate to Supabase Storage (if provided)
  let experienceCertUrl = "";
  if (experienceCert && experienceCert.size > 0) {
    try {
      const certExt = experienceCert.name.split(".").pop() || "pdf";
      const certName = `${userId}/cert_course_${Date.now()}.${certExt}`;
      const certBuffer = Buffer.from(await experienceCert.arrayBuffer());

      const { data: certUpload, error: certErr } = await supabase.storage
        .from("photos")
        .upload(certName, certBuffer, { contentType: experienceCert.type, upsert: true });

      if (certErr) {
        console.error("Certificate upload error:", certErr);
        throw new Error(`Experience certificate upload failed: ${certErr.message}`);
      }

      const { data: certUrlData } = supabase.storage.from("photos").getPublicUrl(certName);
      experienceCertUrl = certUrlData.publicUrl;
    } catch (err: any) {
      console.error("Certificate upload pipeline error:", err);
      return { success: false, error: err.message || "Failed to upload experience certificate." };
    }
  }

  // Upload Qualification Document to Supabase Storage
  let qualificationDocUrl = "";
  if (qualificationDoc && qualificationDoc.size > 0) {
    try {
      const docExt = qualificationDoc.name.split(".").pop() || "pdf";
      const docName = `${userId}/qual_doc_${Date.now()}.${docExt}`;
      const docBuffer = Buffer.from(await qualificationDoc.arrayBuffer());

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("photos")
        .upload(docName, docBuffer, { contentType: qualificationDoc.type, upsert: true });

      if (uploadErr) {
        console.error("Qualification doc upload error:", uploadErr);
        throw new Error(`Qualification document upload failed: ${uploadErr.message}`);
      }

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(docName);
      qualificationDocUrl = urlData.publicUrl;
    } catch (err: any) {
      console.error("Qualification doc upload pipeline error:", err);
      return { success: false, error: err.message || "Failed to upload qualification document." };
    }
  }

  // Upload Aadhaar Document to Supabase Storage
  let aadhaarDocUrl = "";
  if (aadhaarDoc && aadhaarDoc.size > 0) {
    try {
      const docExt = aadhaarDoc.name.split(".").pop() || "pdf";
      const docName = `${userId}/aadhaar_doc_${Date.now()}.${docExt}`;
      const docBuffer = Buffer.from(await aadhaarDoc.arrayBuffer());

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("photos")
        .upload(docName, docBuffer, { contentType: aadhaarDoc.type, upsert: true });

      if (uploadErr) {
        console.error("Aadhaar doc upload error:", uploadErr);
        throw new Error(`Aadhaar card upload failed: ${uploadErr.message}`);
      }

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(docName);
      aadhaarDocUrl = urlData.publicUrl;
    } catch (err: any) {
      console.error("Aadhaar doc upload pipeline error:", err);
      return { success: false, error: err.message || "Failed to upload Aadhaar card document." };
    }
  }

  // 2. Fetch course fee details
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("title, fees")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return { success: false, error: "Selected course was not found." };
  }

  const fees = Number(course.fees);

  try {
    // 3. Atomically generate Enrollment Number DKE-YYYY-XXXXX
    const { data: enrollmentNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "course_reg",
      p_prefix: "DKE"
    });

    if (rpcError || !enrollmentNo) {
      console.error("Enrollment sequence error:", rpcError);
      throw new Error("Failed to generate academy enrollment number.");
    }

    // 4. Insert registration record
    const { data: registration, error: insertError } = await supabase
      .from("course_registrations")
      .insert({
        enrollment_no: enrollmentNo,
        user_id: userId,
        course_id: courseId,
        full_name: fullName,
        mobile,
        email,
        father_name: fatherName,
        photo_url: photoUrl,
        working_sector: workingSector,
        experience_cert_url: experienceCertUrl || null,
        training_center: trainingCenter,
        qualification,
        dob: dob ? new Date(dob).toISOString() : null,
        gender,
        address,
        state,
        district,
        qualification_doc_url: qualificationDocUrl || null,
        aadhaar_doc_url: aadhaarDocUrl || null,
        status: "PENDING"
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Database insert error for registration:", insertError);
      throw new Error(`Failed to log course registration: ${insertError.message}`);
    }

    const registrationId = registration.id;

    // 5. Create pending payment record
    const tempTxnId = "CRS-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount: fees,
        transaction_id: tempTxnId,
        gateway: "PHONEPE",
        status: "PENDING",
        registration_id: registrationId
      });

    if (paymentError) {
      console.error("Failed to insert payment log:", paymentError);
      throw new Error(`Failed to initialize payment tracking: ${paymentError.message}`);
    }

    // 6. Generate Payment Gateway Redirect
    const checkoutUrl = await paymentServiceInstance.processPayment({
      orderId: tempTxnId,
      amount: fees,
      currency: "INR",
      customerEmail: email,
      customerMobile: mobile
    });

    // 7. Return redirect URL without sending email
    return {
      success: true,
      enrollmentNo,
      checkoutUrl,
      message: "Registration successful. Redirecting to payment..."
    };

  } catch (err: any) {
    console.error("Course registration pipeline error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// 3. Generate and Send OTP for course registration
export async function sendCourseOtp(mobile: string, email: string) {
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
    console.error("Error saving Course OTP request:", error);
    return { success: false, error: "Failed to generate OTP. Please try again." };
  }

  // Send Email with OTP
  const subject = "Email Verification OTP - DKFFJ Academy";
  const htmlContent = getCourseVerificationTemplate(code);
  const emailRes = await sendTransactionalEmail(email, subject, htmlContent);

  if (!emailRes.success) {
    console.error("Resend email failed:", emailRes.error);
    return { success: false, error: `OTP bhejne mein samasya aai. Kuch der baad dobara koshish karein ya support se sampark karein.` };
  }

  // Log to console for local developer debugging/testing
  console.log(`[COURSE OTP SENT] To Mobile: ${mobile}, Email: ${email} -> CODE: ${code}`);

  if (emailRes.mock) {
    return {
      success: true,
      message: `[MOCK MODE] OTP: ${code} (Vercel is not reading RESEND_API_KEY).`
    };
  }

  return { success: true, message: "Verification OTP sent successfully. Please check your email." };
}

// 4. Verify OTP for course registration
export async function verifyCourseOtp(mobile: string, email: string, code: string) {
  if (!mobile || !email || !code) {
    return { success: false, error: "Mobile, Email and OTP code are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const now = new Date().toISOString();

  // Fetch the latest active OTP request for this mobile/email combination
  const { data, error } = await supabase
    .from("otp_requests")
    .select("id, otp_code, expires_at, verified")
    .eq("mobile", mobile)
    .eq("email", email)
    .eq("otp_code", code)
    .eq("verified", false)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error checking Course OTP:", error);
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
    console.error("Error updating Course OTP status:", updateError);
    return { success: false, error: "Verification failed. Please try again." };
  }

  return { success: true, message: "Email verified successfully." };
}
