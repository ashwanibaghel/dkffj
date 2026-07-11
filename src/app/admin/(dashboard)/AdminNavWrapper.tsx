"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  Bell,
  Heart,
  Award,
  Sun,
  Moon,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Share2
} from "lucide-react";
import { useTheme } from "next-themes";
import { getAdminNotifications, AdminNotification } from "./actions";

type AdminNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

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
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    applications: true,
    academy: true,
  });

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

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


  const dashboardItem: AdminNavItem = { href: "/admin", label: "Dashboard Home", icon: LayoutDashboard };
  const navSections = [
    {
      id: "applications",
      label: "Applications",
      items: [
        { href: "/admin/members", label: "Members Desk", icon: Users },
        { href: "/admin/referrals", label: "Referrals Desk", icon: Share2 },
        { href: "/admin/complaints", label: "Grievances Desk", icon: ShieldAlert },
        { href: "/admin/appreciation", label: "Appreciation Panel", icon: Award },
      ],
    },
    {
      id: "academy",
      label: "Academy",
      items: [
        { href: "/admin/courses", label: "Courses", icon: BookOpen },
        { href: "/admin/registrations", label: "Enrollments", icon: GraduationCap },
        { href: "/admin/certificates", label: "Certificates", icon: FileCheck },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      items: [
        { href: "/admin/payments", label: "Payments Ledger", icon: CreditCard },
        { href: "/admin/donations", label: "Donations Desk", icon: Heart },
      ],
    },
    {
      id: "content",
      label: "Content",
      items: [
        { href: "/admin/documents", label: "Legal Downloads", icon: FileText },
        { href: "/admin/news", label: "News/Blogs", icon: Newspaper },
        { href: "/admin/leaders", label: "Executive Council", icon: Users },
        { href: "/admin/banners", label: "Slider Banners", icon: ImageIcon },
        { href: "/admin/gallery", label: "Media Gallery", icon: ImageIcon },
      ],
    },
    {
      id: "system",
      label: "System",
      items: [
        { href: "/admin/settings", label: "Portal Settings", icon: Settings },
      ],
    },
  ];

  const renderNavLink = (item: AdminNavItem, isCompact = false) => {
    const IconComponent = item.icon;
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsSidebarOpen(false)}
        title={isSidebarCollapsed ? item.label : undefined}
        className={`flex items-center rounded-xl text-xs font-bold transition-all duration-200 group ${
          isSidebarCollapsed
            ? "md:justify-center md:px-0 md:py-3 gap-0"
            : `gap-3 ${isCompact ? "px-3 py-2" : "px-3.5 py-2.5"}`
        } ${
          isActive
            ? "bg-blue-50 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-blue-600/5 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-inner"
            : "hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <IconComponent className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
        <span className={`${isSidebarCollapsed ? "md:hidden" : ""} tracking-wide`}>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Backdrop overlay (mobile only) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-all duration-300"
        />
      )}

      {/* Admin Nav Top */}
      <header className="h-16 md:h-[72px] border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#050C1A]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-none transition-colors duration-300">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open admin navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            className="hidden md:flex p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label={isSidebarCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#001C55] to-[#C00000] shadow-md shadow-red-900/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Image src="/logo.png" width={20} height={20} className="object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="font-extrabold text-xs tracking-wide text-slate-900 dark:text-white font-sans">DKFFJ Portal</span>
              <span className="text-[7.5px] text-[#C00000] dark:text-red-500 font-black tracking-[0.2em] leading-none mt-0.5">ADMINISTRATION SHELL</span>
            </div>
          </Link>

          <div className="hidden lg:flex flex-col ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
            <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-tight">Administrative Shell Control</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium leading-none mt-0.5">Real-time metrics, records management, and audit desk.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsNotifOpen(!isNotifOpen);
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 cursor-pointer relative flex items-center justify-center"
              aria-label="Admin Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C00000] dark:bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </button>

            {isNotifOpen && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:shadow-2xl overflow-hidden z-50 text-slate-700 dark:text-slate-200 transition-colors duration-300"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                  <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">System Action Items</span>
                  <span className="text-[9px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    {notifications.length} Pending
                  </span>
                </div>
                
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                  {loadingNotifs ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">No new action items.</div>
                  ) : (
                    notifications.map((notif) => {
                      let Icon = Bell;
                      let iconColor = "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-500/10";
                      
                      if (notif.type === "registration") {
                        Icon = GraduationCap;
                        iconColor = "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10";
                      } else if (notif.type === "membership") {
                        Icon = Users;
                        iconColor = "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10";
                      } else if (notif.type === "payment") {
                        Icon = CreditCard;
                        iconColor = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10";
                      }

                      return (
                        <Link
                          key={notif.id}
                          href={notif.link}
                          onClick={() => setIsNotifOpen(false)}
                          className="flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left group"
                        >
                          <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center shrink-0 shadow-sm dark:shadow-none group-hover:scale-105 transition-transform`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{notif.title}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                                {formatTimeAgo(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed break-words font-medium">
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

          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline-block">
            Signed in as: <strong className="text-slate-800 dark:text-white font-extrabold">{profile.full_name || email}</strong>
          </span>
          <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase shadow-sm dark:shadow-none border border-red-100 dark:border-red-900/30">
            {profile.role}
          </span>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* Sidebar Panel */}
        <aside className={`bg-white dark:bg-none dark:bg-[#050C1A] border-r border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 flex flex-col justify-between shrink-0 
          fixed md:sticky top-16 h-[calc(100vh-64px)] w-64 ${isSidebarCollapsed ? "md:w-20" : "md:w-64"} z-30 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgb(0,0,0,0.02)] dark:shadow-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          
          <div className={`${isSidebarCollapsed ? "md:p-3" : "p-4"} space-y-1 overflow-y-auto flex-1 custom-scrollbar`}>
            <span className={`${isSidebarCollapsed ? "md:hidden" : ""} block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-3 mb-4 mt-2`}>Management Modules</span>

            {renderNavLink(dashboardItem)}

            <div className={`${isSidebarCollapsed ? "pt-2 space-y-1" : "pt-3 space-y-3"}`}>
              {isSidebarCollapsed ? (
                navSections.flatMap((section) => section.items).map((item) => renderNavLink(item, true))
              ) : (
                navSections.map((section) => {
                  const hasActiveItem = section.items.some((item) => item.href === pathname);
                  const isOpen = openSections[section.id] || hasActiveItem;

                  return (
                    <div key={section.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSections((current) => ({
                            ...current,
                            [section.id]: !current[section.id],
                          }))
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.14em] transition-all ${
                          hasActiveItem
                            ? "text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-500/10"
                            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                        aria-expanded={isOpen}
                      >
                        <span>{section.label}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isOpen && (
                        <div className="space-y-1 pl-1">
                          {section.items.map((item) => renderNavLink(item, true))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar Footer Log out */}
          <div className={`${isSidebarCollapsed ? "md:p-3" : "p-5"} border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#050C1A]`}>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-900/30 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all cursor-pointer group ${isSidebarCollapsed ? "md:px-0" : "px-3"}`}
                title={isSidebarCollapsed ? "Log Out Shell" : undefined}
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className={isSidebarCollapsed ? "md:hidden" : ""}>Log Out Shell</span>
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
