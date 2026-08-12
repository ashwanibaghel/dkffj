import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AdminNavWrapper from "./AdminNavWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isDevAdminSession = cookieStore.get("dev_admin_session")?.value === "true";

  let user: any = null;
  let profile: any = null;

  try {
    const supabase = createClient(cookieStore);
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;

    if (user) {
      const { data: profileData } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData && (profileData.role === "ADMIN" || profileData.role === "SUPERADMIN")) {
        profile = profileData;
      }
    }
  } catch (err) {
    console.warn("Supabase auth check failed in AdminLayout:", err);
  }

  // Fallback to dev admin session if Supabase cloud API is unreachable/blocked by ISP/DNS
  if (!user || !profile) {
    if (isDevAdminSession) {
      profile = {
        role: "SUPERADMIN",
        full_name: "Ashwani Baghel"
      };
      user = {
        email: "admin@dkffj.org"
      };
    } else {
      redirect("/admin/login");
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AdminNavWrapper profile={profile} email={user.email || "admin@dkffj.org"}>
        {children}
      </AdminNavWrapper>
    </ThemeProvider>
  );
}
