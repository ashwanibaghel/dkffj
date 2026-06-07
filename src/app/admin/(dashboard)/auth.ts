"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
      
    if (profileError || !profile) {
      return null;
    }
    
    if (profile.role === "ADMIN" || profile.role === "SUPERADMIN") {
      return user;
    }
    return null;
  } catch (error) {
    console.error("Admin verification error:", error);
    return null;
  }
}
