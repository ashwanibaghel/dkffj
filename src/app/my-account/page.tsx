"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, CreditCard, Award, FileText, ClipboardList, Bell, 
  Download, IdCard, Loader2, LogOut, ArrowRight, UserCheck, 
  CheckCircle2, Clock, ShieldAlert, Edit2, Key, Mail 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getAccountDetails, updateProfileDetails, AccountData } from "./actions";
import { generateMembershipPDFClient } from "../admin/(dashboard)/members/MembershipCertificateGenerator";
import { generateMembershipIdCardPDFClient } from "../admin/(dashboard)/members/MembershipIdCardGenerator";

export default function MyAccountPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<AccountData | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  // Login form states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string>("");

  // Edit Profile States
  const [editName, setEditName] = useState<string>("");
  const [updatingProfile, setUpdatingProfile] = useState<boolean>(false);

  // Document downloads loading state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    setUserSession(session);
    if (session) {
      fetchAccountData();
    } else {
      setLoading(false);
    }
  };

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const res = await getAccountDetails();
      setData(res);
      if (res.profile) {
        setEditName(res.profile.fullName);
      }
    } catch (err) {
      console.error("Failed to load account details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccessMsg("");
    setLoginLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        setLoginError(authError.message || "Invalid credentials.");
        setLoginLoading(false);
        return;
      }

      if (authData.session) {
        setUserSession(authData.session);
        await fetchAccountData();
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccessMsg("");
    setLoginLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/my-account`
        }
      });

      if (error) {
        setLoginError(error.message);
      } else {
        setLoginSuccessMsg("Magic login link has been sent to your email. Please check your inbox.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to trigger login link.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserSession(null);
    setData(null);
    setActiveTab("dashboard");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setUpdatingProfile(true);
    try {
      const res = await updateProfileDetails(editName.trim());
      if (res.success) {
        await fetchAccountData();
        alert("Profile details updated successfully.");
      } else {
        alert(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      alert(err.message || "Error updating profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDownloadCertificate = async (member: any) => {
    setDownloadingId(member.id);
    try {
      const appUrl = window.location.origin;
      const certNo = member.membership_no || member.ack_no;
      const verificationUrl = `${appUrl}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDateStr = member.approved_at 
        ? new Date(member.approved_at).toLocaleDateString("en-IN")
        : (member.created_at ? new Date(member.created_at).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"));

      const pdfBlob = await generateMembershipPDFClient({
        membershipNo: member.membership_no || certNo || "",
        ackNo: member.ack_no || certNo || "",
        fullName: member.full_name || "",
        fatherName: member.father_name,
        designation: member.designation,
        workingArea: member.working_area,
        photoUrl: member.photo_url,
        issueDateStr,
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_Certificate_${certNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadIdCard = async (member: any) => {
    setDownloadingId(member.id + "-card");
    try {
      const appUrl = window.location.origin;
      const certNo = member.membership_no || member.ack_no;
      const verificationUrl = `${appUrl}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDate = member.approved_at ? new Date(member.approved_at) : (member.created_at ? new Date(member.created_at) : new Date());
      const issueDateStr = issueDate.toLocaleDateString("en-IN");
      
      const validFromStr = issueDate.toISOString().split("T")[0];
      const validToDate = new Date(issueDate);
      validToDate.setFullYear(validToDate.getFullYear() + 1);
      validToDate.setDate(validToDate.getDate() - 1);
      const validToStr = validToDate.toISOString().split("T")[0];

      const pdfBlob = await generateMembershipIdCardPDFClient({
        membershipNo: member.membership_no || certNo || "",
        ackNo: member.ack_no || certNo || "",
        fullName: member.full_name || "",
        fatherName: member.father_name,
        designation: member.designation,
        workingArea: member.working_area,
        photoUrl: member.photo_url,
        issueDateStr,
        validFromStr,
        validToStr,
        addressStr: member.address || "",
        districtStr: member.district || "",
        stateStr: member.state || "",
        pincodeStr: member.pincode || "",
        mobileStr: member.mobile || "",
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_ID_Card_${certNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error generating ID Card: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "COMPLETED", "RESOLVED", "VALID"].includes(s)) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (["PENDING", "SUBMITTED"].includes(s)) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (["UNDER_REVIEW", "IN_PROGRESS"].includes(s)) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    );
  }

  // Render Auth UI if not logged in
  if (!userSession || !data?.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] text-slate-900 flex flex-col justify-center items-center p-6 relative font-sans">
        <header className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between border-b border-sky-100/60 bg-white/60 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0]/10 to-[#1565C0]/5 border border-sky-100 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1565C0] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#001C55] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:text-[#0D47A1] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </header>

        <div className="max-w-md w-full bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-2xl mt-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black font-serif text-[#001C55]">My Account Portal</h1>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Verify applications, download official ID cards/certificates, and manage your credentials.
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{loginSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sky-100 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Account Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sky-100 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Account"}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 border-b border-sky-50 -z-10"></span>
            <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or passwordless login</span>
          </div>

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loginLoading || !email}
            className="w-full py-3 border border-sky-100 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Mail className="w-4 h-4 text-[#1565C0]" /> Send Login Magic Link
          </button>
        </div>
      </div>
    );
  }

  const { profile, memberships, courses, complaints, notifications } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] text-slate-900 flex flex-col font-sans relative">
      {/* Header */}
      <header className="border-b border-sky-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0]/10 to-[#1565C0]/5 border border-sky-100 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1565C0] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#001C55] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs font-bold text-slate-500">Welcome, {profile.fullName}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-100 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 z-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: User },
            { id: "applications", label: "My Applications", icon: ClipboardList },
            { id: "downloads", label: "Downloads Center", icon: Download },
            { id: "profile", label: "Edit Profile", icon: Edit2 },
            { id: "notifications", label: "Alerts Center", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#1565C0] text-white shadow-lg shadow-sky-600/10"
                    : "bg-white border border-sky-100/50 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Content Panel */}
        <section className="flex-1 min-w-0">
          
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Greeting */}
              <div className="bg-gradient-to-r from-[#1565C0] to-[#0D47A1] rounded-3xl p-6 sm:p-8 text-white text-left shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-200">DKFFJ Resident Portal</span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif mt-2">Hello, {profile.fullName}</h2>
                <p className="text-sky-100 text-xs mt-1 leading-relaxed max-w-lg">
                  Access your dynamic files, view active memberships, track course approvals, and query grievance statuses in real-time.
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Memberships</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">{memberships.filter(m => m.status === "APPROVED").length}</span>
                </div>
                <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Course Registrations</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">{courses.length}</span>
                </div>
                <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Open Grievances</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">{complaints.filter(c => c.status !== "RESOLVED").length}</span>
                </div>
              </div>

              {/* Quick Applications list */}
              <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-800 font-serif mb-4">Recent Activity</h3>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No recent system notifications received.</p>
                ) : (
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((notif) => (
                      <div key={notif.id} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 text-[#1565C0]">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-slate-800 font-semibold">{notif.subject || "System Notification"}</strong>
                          <p className="text-slate-500 text-[11px] mt-0.5">{notif.body}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">{new Date(notif.sent_at).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY APPLICATIONS TAB */}
          {activeTab === "applications" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-serif">My Applications Ledger</h2>
                <p className="text-slate-500 text-xs mt-0.5">Track and download files for membership registrations, course enrollments, and grievances.</p>
              </div>

              {memberships.length === 0 && courses.length === 0 && complaints.length === 0 ? (
                <div className="bg-white border border-sky-100 rounded-3xl p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-slate-700 font-bold">No active registrations found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You have not registered for memberships, courses, or grievances. Fill out our online forms to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Memberships */}
                  {memberships.map((member) => (
                    <div key={member.id} className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-[#1565C0] uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-100">Membership Application</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-2">{member.designation || "Executive Member"}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Ref ID: <span className="font-semibold">{member.ack_no}</span></p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] border font-bold uppercase ${getStatusBadge(member.status)}`}>
                          {member.status}
                        </span>
                        <Link
                          href={`/track/membership?id=${member.ack_no}`}
                          className="px-3 py-1.5 border border-sky-100 text-[#1565C0] hover:text-[#0D47A1] hover:bg-slate-50 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Track Log
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Course Enrollments */}
                  {courses.map((reg) => (
                    <div key={reg.id} className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">Academy Course</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-2">{reg.courses?.title || "Selected Course"}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Enrollment: <span className="font-semibold">{reg.enrollment_no || "PENDING VERIFICATION"}</span></p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] border font-bold uppercase ${getStatusBadge(reg.status)}`}>
                          {reg.status}
                        </span>
                        <Link
                          href={`/track/course?id=${reg.enrollment_no || ""}`}
                          className="px-3 py-1.5 border border-sky-100 text-[#1565C0] hover:text-[#0D47A1] hover:bg-slate-50 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Track Log
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* Grievances */}
                  {complaints.map((comp) => (
                    <div key={comp.id} className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Grievance Complaint</span>
                        <h4 className="font-bold text-slate-800 text-sm mt-2 max-w-sm truncate">{comp.details}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Docket No: <span className="font-semibold">{comp.complaint_no}</span></p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] border font-bold uppercase ${getStatusBadge(comp.status)}`}>
                          {comp.status}
                        </span>
                        <Link
                          href={`/track/complaint?id=${comp.complaint_no}`}
                          className="px-3 py-1.5 border border-sky-100 text-[#1565C0] hover:text-[#0D47A1] hover:bg-slate-50 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Track Log
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOWNLOADS TAB */}
          {activeTab === "downloads" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-serif">Downloads Center</h2>
                <p className="text-slate-500 text-xs mt-0.5">Access and save all approved ID Cards, membership certificates, and graduation receipts.</p>
              </div>

              {memberships.filter(m => m.status === "APPROVED").length === 0 && 
               courses.filter(c => c.status === "APPROVED" || c.status === "COMPLETED").length === 0 ? (
                <div className="bg-white border border-sky-100 rounded-3xl p-12 text-center">
                  <Download className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-slate-700 font-bold">No certificates available yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your applications are currently processing. Verification credentials and download buttons will appear here once verified.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Membership certificates & ID card downloads */}
                  {memberships
                    .filter((m) => m.status === "APPROVED")
                    .map((member) => (
                      <div key={member.id} className="bg-white border border-sky-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                        <div>
                          <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">Approved Member</span>
                          <h4 className="font-bold text-slate-800 text-sm mt-2">{member.designation}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Ack: {member.ack_no}</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDownloadCertificate(member)}
                            disabled={downloadingId !== null}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {downloadingId === member.id ? <Loader2 className="w-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            Certificate
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadIdCard(member)}
                            disabled={downloadingId !== null}
                            className="px-3.5 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {downloadingId === member.id + "-card" ? <Loader2 className="w-3 animate-spin" /> : <IdCard className="w-3 h-3" />}
                            ID Card
                          </button>
                        </div>
                      </div>
                    ))}

                  {/* Course graduation certificates */}
                  {courses
                    .filter((c) => (c.status === "APPROVED" || c.status === "COMPLETED") && c.certificates && c.certificates.length > 0)
                    .map((reg) => {
                      const cert = reg.certificates[0];
                      if (!cert || cert.status !== "VALID") return null;
                      return (
                        <div key={reg.id} className="bg-white border border-sky-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                          <div>
                            <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">Course Completed</span>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">{reg.courses?.title || "Academy Course"}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Cert No: {cert.certificate_no}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-50 shrink-0">
                            <a
                              href={cert.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                            >
                              <Download className="w-3 h-3" /> Download Certificate
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* EDIT PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-serif">Edit Profile Details</h2>
                <p className="text-slate-500 text-xs mt-0.5">Update your basic account identifiers linked to DKFFJ central database.</p>
              </div>

              <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Email</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full px-4 py-2.5 rounded-xl border border-sky-50 text-xs bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Account emails cannot be altered after verification.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sky-100 text-xs bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1565C0]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile || !editName.trim()}
                    className="py-2.5 px-6 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {updatingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save Updates
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-serif">Alerts Center</h2>
                <p className="text-slate-500 text-xs mt-0.5">Read updates regarding application milestones, membership validations, and grievance outcomes.</p>
              </div>

              <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-sky-50 bg-slate-50/50">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alert History Logs</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 italic">No system notifications found.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-5 flex gap-4 text-xs font-medium text-slate-750 hover:bg-slate-50/30 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 text-[#1565C0]">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <strong className="text-slate-850 font-bold text-sm block">{notif.subject || "Alert update"}</strong>
                          <p className="text-slate-650 text-xs mt-1 leading-relaxed">{notif.body}</p>
                          <span className="text-[10px] text-slate-400 block mt-2 font-semibold">
                            Received {new Date(notif.sent_at).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </section>

      </main>

      <footer className="py-8 border-t border-sky-50 text-center text-[10px] text-slate-400 bg-white/50 backdrop-blur-sm z-10">
        &copy; {new Date().getFullYear()} DK Foundation of Freedom & Justice. All Rights Reserved. • My Account Verification Portal
      </footer>
    </div>
  );
}
