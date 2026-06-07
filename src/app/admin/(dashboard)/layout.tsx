import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  GraduationCap, 
  FileCheck, 
  CreditCard, 
  Settings, 
  FileText, 
  LogOut, 
  Newspaper,
  BookOpen
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Admin Nav Top */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-800 z-25 sticky top-0">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0F4C81] to-[#D62828] border border-slate-800 flex items-center justify-center">
            <img src="/logo.png" className="w-5 h-5 object-contain" alt="DKFFJ Logo" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wider font-serif">DKFFJ Portal</span>
            <span className="text-[7px] text-[#D62828] font-bold tracking-widest leading-none">ADMINISTRATION SHELL</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-slate-400">Signed in as: <strong className="text-white font-bold">{profile.full_name || user.email}</strong></span>
          <span className="bg-[#D62828]/25 border border-[#D62828]/50 text-red-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
            {profile.role}
          </span>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Sidebar Panel */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between shrink-0 sticky top-16 h-[calc(100vh-64px)] z-20">
          <div className="p-4 space-y-1">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Management Modules</span>
            
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard Home
            </Link>
            
            <Link
              href="/admin/members"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <Users className="w-4 h-4" /> Members Desk
            </Link>

            <Link
              href="/admin/complaints"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <ShieldAlert className="w-4 h-4" /> Grievances Desk
            </Link>

            <Link
              href="/admin/courses"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <BookOpen className="w-4 h-4" /> Academy Courses
            </Link>

            <Link
              href="/admin/registrations"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <GraduationCap className="w-4 h-4" /> Enrollments Panel
            </Link>

            <Link
              href="/admin/certificates"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <FileCheck className="w-4 h-4" /> Certificates Registry
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <CreditCard className="w-4 h-4" /> Payments Ledger
            </Link>
            
            <Link
              href="/admin/documents"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <FileText className="w-4 h-4" /> Legal Downloads
            </Link>

            <Link
              href="/admin/news"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <Newspaper className="w-4 h-4" /> News/Blogs Desk
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:bg-slate-800 hover:text-white"
            >
              <Settings className="w-4 h-4" /> Portal Settings
            </Link>
          </div>

          {/* Sidebar Footer Log out */}
          <div className="p-4 border-t border-slate-800">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-800 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log Out Shell
              </button>
            </form>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
          {children}
        </main>

      </div>
    </div>
  );
}
