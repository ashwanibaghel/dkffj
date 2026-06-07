"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// 1. Fetch issued certificates
export async function getCertificates() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
  return data || [];
}

// 2. Revoke or Activate Certificate
export async function toggleCertificateStatus(id: string, currentStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  const newStatus = currentStatus === "VALID" ? "REVOKED" : "VALID";

  const { error } = await supabase
    .from("certificates")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Failed to toggle certificate state:", error);
    return { success: false, error: "Database toggle error." };
  }

  return { success: true };
}
