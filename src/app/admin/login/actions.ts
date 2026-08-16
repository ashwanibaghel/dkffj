"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function adminLoginAction(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Attempt standard Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!authError && authData.user) {
      // Double check profile role
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (!profileError && profile) {
        if (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN") {
          await supabase.auth.signOut();
          return { success: false, error: "Access Denied: You do not have administrator permissions." };
        }
        return { success: true };
      }
    }

    if (authError && !authError.message.includes("fetch failed")) {
      return { success: false, error: authError.message || "Invalid credentials." };
    }
  } catch (err: any) {
    console.warn("Supabase admin authentication failed:", err?.message || err);
  }

  return { success: false, error: "Invalid admin email or password." };
}

export async function checkAdminSessionAction() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && (profile.role === "ADMIN" || profile.role === "SUPERADMIN")) {
        return { isLoggedIn: true };
      }
    }
    return { isLoggedIn: false };
  } catch (err) {
    return { isLoggedIn: false };
  }
}
