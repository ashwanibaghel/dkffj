"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface AccountData {
  profile: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
  } | null;
  memberships: any[];
  courses: any[];
  complaints: any[];
  notifications: any[];
  referredCount: number;
}

/** Fetch all account details linked to the logged-in user */
export async function getAccountDetails(): Promise<AccountData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, memberships: [], courses: [], complaints: [], notifications: [], referredCount: 0 };
  }

  // 1. Get profile from public users table
  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  // 2. Get memberships
  const { data: memberships } = await supabase
    .from("memberships")
    .select(`
      id,
      ack_no,
      membership_no,
      full_name,
      father_name,
      mobile,
      email,
      gender,
      dob,
      designation,
      working_area,
      address,
      district,
      state,
      pincode,
      photo_url,
      status,
      created_at,
      updated_at,
      approved_at,
      status_logs (
        id,
        from_status,
        to_status,
        remarks,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Get course registrations
  const { data: courses } = await supabase
    .from("course_registrations")
    .select(`
      id,
      enrollment_no,
      full_name,
      email,
      status,
      created_at,
      updated_at,
      courses (
        title
      ),
      certificates (
        certificate_no,
        pdf_url,
        status
      ),
      status_logs (
        id,
        from_status,
        to_status,
        remarks,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Get complaints
  const { data: complaints } = await supabase
    .from("complaints")
    .select(`
      id,
      complaint_no,
      name,
      mobile,
      email,
      status,
      created_at,
      updated_at,
      details,
      status_logs (
        id,
        from_status,
        to_status,
        remarks,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 5. Get notifications (limited to top 20 recent logs)
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, subject, body, sent_at, success")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(20);

  // Find approved membership ID to count referrals
  let referredCount = 0;
  const approvedMember = (memberships || []).find((m: any) => m.status === "APPROVED");
  if (approvedMember) {
    const { count, error: countError } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("referred_by_member_id", approvedMember.id);
    
    if (!countError && count !== null) {
      referredCount = count;
    }
  }

  return {
    profile: profile ? {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      createdAt: new Date(profile.created_at).toLocaleDateString("en-IN"),
    } : null,
    memberships: memberships || [],
    courses: courses || [],
    complaints: complaints || [],
    notifications: notifications || [],
    referredCount
  };
}

/** Update profile info */
export async function updateProfileDetails(fullName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized access." };
  }

  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/my-account");
  return { success: true };
}
