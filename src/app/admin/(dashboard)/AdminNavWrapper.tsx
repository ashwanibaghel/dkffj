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
  X,
  Bell,
  AlertCircle
} from "lucide-react";
import { getAdminNotifications, AdminNotification } from "./actions";

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
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Close sidebar on route change (for mobile viewports)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Load Admin Notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getAdminNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoadingNotifs(false);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (!isNotifOpen) return;
    const handleClose = () => setIsNotifOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isNotifOpen]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };


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
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#001C55] to-[#C00000] border border-slate-800 flex items-center justify-center">
              <img src="/logo.png" className="w-5 h-5 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-wider font-serif">DKFFJ Portal</span>
              <span className="text-[7px] text-[#C00000] font-bold tracking-widest leading-none">ADMINISTRATION SHELL</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsNotifOpen(!isNotifOpen);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative flex items-center justify-center"
              aria-label="Admin Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-[#C00000] text-white rounded-full flex items-center justify-center text-[9px] font-extrabold border border-slate-900 animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl overflow-hidden z-50 text-slate-200"
              >
                <div className="px-4 py-3 border-b border-slate-850 flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">System Action Items</span>
                  <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">
                    {notifications.length} Pending
                  </span>
                </div>
                
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-850/60">
                  {loadingNotifs ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic">No new action items.</div>
                  ) : (
                    notifications.map((notif) => {
                      let Icon = Bell;
                      let iconColor = "text-sky-450 bg-sky-500/10";
                      
                      if (notif.type === "registration") {
                        Icon = GraduationCap;
                        iconColor = "text-purple-400 bg-purple-500/10";
                      } else if (notif.type === "membership") {
                        Icon = Users;
                        iconColor = "text-blue-400 bg-blue-500/10";
                      } else if (notif.type === "payment") {
                        Icon = CreditCard;
                        iconColor = "text-emerald-400 bg-emerald-500/10";
                      }

                      return (
                        <Link
                          key={notif.id}
                          href={notif.link}
                          onClick={() => setIsNotifOpen(false)}
                          className="flex gap-3 p-3.5 hover:bg-slate-800/40 transition-colors text-left border-b border-slate-850/30"
                        >
                          <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-white truncate">{notif.title}</span>
                              <span className="text-[9px] text-slate-500 shrink-0 font-medium">
                                {formatTimeAgo(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed break-words">
                              {notif.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="text-slate-400 hidden sm:inline-block">
            Signed in as: <strong className="text-white font-bold">{profile.full_name || email}</strong>
          </span>
          <span className="bg-[#C00000]/25 border border-[#C00000]/50 text-red-300 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
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
                      ? "bg-[#001C55] text-white" 
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
