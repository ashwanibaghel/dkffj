import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AdminNavWrapper from "./AdminNavWrapper";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // 2. Fetch user role
  const { data: profile, error } = await supabase
    .from("users")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    console.error("Error fetching user profile in admin layout:", error);
    redirect("/admin/login");
  }

  // 3. Authorization check (only ADMIN or SUPERADMIN)
  if (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN") {
    redirect("/"); // Unauthorized users are sent to home
  }

  return (
    <AdminNavWrapper profile={profile} email={user.email!}>
      {children}
    </AdminNavWrapper>
  );
}
