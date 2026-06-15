"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  BookOpen,
  Image as ImageIcon,
  Menu,
  X
} from "lucide-react";

interface AdminNavWrapperProps {
  profile: {
    role: string;
    full_name: string | null;
  };
  email: string;
  children: React.ReactNode;
}

export default function AdminNavWrapper({
  profile,
  email,
  children
}: AdminNavWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change (for mobile viewports)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/admin", label: "Dashboard Home", icon: LayoutDashboard },
    { href: "/admin/members", label: "Members Desk", icon: Users },
    { href: "/admin/complaints", label: "Grievances Desk", icon: ShieldAlert },
    { href: "/admin/courses", label: "Academy Courses", icon: BookOpen },
    { href: "/admin/registrations", label: "Enrollments Panel", icon: GraduationCap },
    { href: "/admin/certificates", label: "Certificates Registry", icon: FileCheck },
    { href: "/admin/payments", label: "Payments Ledger", icon: CreditCard },
    { href: "/admin/documents", label: "Legal Downloads", icon: FileText },
    { href: "/admin/news", label: "News/Blogs Desk", icon: Newspaper },
    { href: "/admin/leaders", label: "Executive Council", icon: Users },
    { href: "/admin/banners", label: "Slider Banners", icon: ImageIcon },
    { href: "/admin/settings", label: "Portal Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Backdrop overlay (mobile only) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-all duration-300"
        />
      )}

      {/* Admin Nav Top */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-800 z-40 sticky top-0">
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Trigger */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
          
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0F4C81] to-[#D62828] border border-slate-800 flex items-center justify-center">
              <img src="/logo.png" className="w-5 h-5 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-wider font-serif">DKFFJ Portal</span>
              <span className="text-[7px] text-[#D62828] font-bold tracking-widest leading-none">ADMINISTRATION SHELL</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-slate-400 hidden sm:inline-block">
            Signed in as: <strong className="text-white font-bold">{profile.full_name || email}</strong>
          </span>
          <span className="bg-[#D62828]/25 border border-[#D62828]/50 text-red-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
            {profile.role}
          </span>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Sidebar Panel */}
        <aside className={`bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between shrink-0 
          fixed md:sticky top-16 h-[calc(100vh-64px)] w-64 z-30 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Management Modules</span>
            
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-[#0F4C81] text-white" 
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Log out */}
          <div className="p-4 border-t border-slate-800 bg-slate-900">
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-64px)] w-full">
          {children}
        </main>

      </div>
    </div>
  );
}
