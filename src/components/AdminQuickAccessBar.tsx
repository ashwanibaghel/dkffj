"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, X, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminQuickAccessBar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>("");
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    // If we're already inside admin routes, don't display this bar
    if (pathname?.startsWith("/admin")) {
      setChecking(false);
      return;
    }

    async function checkAdminSession() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && (profile.role === "ADMIN" || profile.role === "SUPERADMIN")) {
          setIsAdmin(true);
          setAdminName(profile.full_name || user.email || "Admin");
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin session for QuickAccessBar:", err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    }

    checkAdminSession();
  }, [pathname]);

  // Don't render inside /admin or if not admin or if dismissed
  if (pathname?.startsWith("/admin") || !isAdmin || dismissed || checking) {
    return null;
  }

  return (
    <aside aria-label="Admin Navigation Control" className="relative z-[9999]">
      <div className="bg-gradient-to-r from-slate-950 via-[#001C55] to-[#900000] text-white py-2 px-4 shadow-xl border-b border-red-500/30 flex items-center justify-between text-xs font-sans transition-all duration-300">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="flex items-center gap-1.5 bg-red-600/80 text-white px-2.5 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase shadow-sm animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Session Active
          </span>
          <span className="hidden sm:inline text-slate-200 font-medium">
            Signed in as <strong className="text-white font-bold">{adminName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-100 font-extrabold px-3.5 py-1 rounded-lg text-xs shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-[#001C55]" />
            <span>Return to Admin Panel</span>
          </Link>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="Minimize Bar"
            aria-label="Minimize Admin Bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
