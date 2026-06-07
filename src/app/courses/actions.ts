"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { paymentServiceInstance } from "@/lib/payment/service";
import { sendTransactionalEmail } from "@/services/email/service";
import { getCourseRegistrationReceiptTemplate } from "@/services/email/templates";

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

  if (!courseId || !fullName || !mobile || !email) {
    return { success: false, error: "Please fill in all registration fields." };
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      console.error("Auth academy registration error:", authError);
      return { success: false, error: `Account registration failed: ${authError.message}` };
    }

    if (!authData.user) {
      return { success: false, error: "Account creation failed. Please check credentials." };
    }

    userId = authData.user.id;
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
    const tempTxnId = "TXN-" + Math.random().toString(36).substring(2, 11).toUpperCase();

    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        amount: fees,
        transaction_id: tempTxnId,
        gateway: "MOCK_PAYMENT",
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

    // 7. Send initial receipt (awaiting payment completion)
    const emailSubject = `Course Registration Received (Awaiting Payment) - DKFFJ Academy`;
    const emailHtml = getCourseRegistrationReceiptTemplate(fullName, course.title, enrollmentNo, fees);
    await sendTransactionalEmail(email, emailSubject, emailHtml);

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
