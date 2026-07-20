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
    // Attempt login on the server side
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message || "Invalid credentials." };
    }

    if (authData.user) {
      // Double check profile role
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        return { success: false, error: "Failed to load user permissions." };
      }

      if (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN") {
        // Sign them out immediately to clear cookie session
        await supabase.auth.signOut();
        return { success: false, error: "Access Denied: You do not have administrator permissions." };
      }

      return { success: true };
    }

    return { success: false, error: "Authentication failed." };
  } catch (err: any) {
    console.error("Server-side admin login error:", err);
    return { success: false, error: err.message || "An unexpected login error occurred." };
  }
}
