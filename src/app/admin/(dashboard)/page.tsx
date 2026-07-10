import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  ShieldAlert, 
  BookOpen, 
  GraduationCap, 
  IndianRupee,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export const dynamic = "force-dynamic";

type ActivityType = "membership" | "complaint" | "course" | "certificate" | "payment";

type ActivityItem = {
  time: Date;
  title: string;
  desc: string;
  type: ActivityType;
};

type MemberLog = {
  full_name: string;
  ack_no: string;
  created_at: string;
  status: string;
};

type ComplaintLog = {
  name: string;
  complaint_no: string;
  created_at: string;
  status: string;
};

type CourseLog = {
  full_name: string;
  enrollment_no?: string | null;
  created_at: string;
  status: string;
};

type CertificateLog = {
  user_name: string;
  certificate_no: string;
  created_at: string;
};

type PaymentLog = {
  amount: number | string;
  transaction_id: string;
  created_at: string;
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch Stats Aggregates & Recent Lists in Parallel (Promise.all)
  const [
    totalMembersRes,
    pendingMembersRes,
    totalComplaintsRes,
    activeComplaintsRes,
    totalCoursesRes,
    totalEnrollmentsRes,
    paymentDataRes,
    recentComplaintsRes,
    recentMembersRes
  ] = await Promise.all([
    supabase.from("memberships").select("*", { count: "exact", head: true }),
    supabase.from("memberships").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    supabase.from("complaints").select("*", { count: "exact", head: true }),
    supabase.from("complaints").select("*", { count: "exact", head: true }).in("status", ["SUBMITTED", "UNDER_INVESTIGATION", "IN_PROGRESS"]),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("course_registrations").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("status", "COMPLETED"),
    supabase.from("complaints").select("id, complaint_no, name, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("memberships").select("id, ack_no, membership_no, full_name, status, created_at").order("created_at", { ascending: false }).limit(5)
  ]);

  const totalMembers = totalMembersRes.count || 0;
  const pendingMembers = pendingMembersRes.count || 0;
  const totalComplaints = totalComplaintsRes.count || 0;
  const activeComplaints = activeComplaintsRes.count || 0;
  const totalCourses = totalCoursesRes.count || 0;
  const totalEnrollments = totalEnrollmentsRes.count || 0;
  const paymentData = paymentDataRes.data || [];
  const recentComplaints = recentComplaintsRes.data || [];
  const recentMembers = recentMembersRes.data || [];

  const totalRevenue = paymentData.reduce((acc, pay) => acc + Number(pay.amount), 0);

  // 5. Fetch logs for Activity Timeline
  const [membersLogs, complaintsLogs, courseLogs, certLogs, payLogs] = await Promise.all([
    supabase.from("memberships").select("full_name, ack_no, created_at, status").order("created_at", { ascending: false }).limit(5),
    supabase.from("complaints").select("name, complaint_no, created_at, status").order("created_at", { ascending: false }).limit(5),
    supabase.from("course_registrations").select("full_name, enrollment_no, created_at, status").order("created_at", { ascending: false }).limit(5),
    supabase.from("certificates").select("user_name, certificate_no, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("amount, transaction_id, created_at").eq("status", "COMPLETED").order("created_at", { ascending: false }).limit(5),
  ]);

  const activities: ActivityItem[] = [];
  if (membersLogs.data) {
    (membersLogs.data as MemberLog[]).forEach((m) => {
      activities.push({
        time: new Date(m.created_at),
        title: "Membership Applied",
        desc: `${m.full_name} submitted form (${m.ack_no})`,
        type: "membership"
      });
    });
  }
  if (complaintsLogs.data) {
    (complaintsLogs.data as ComplaintLog[]).forEach((c) => {
      activities.push({
        time: new Date(c.created_at),
        title: "Complaint Filed",
        desc: `Grievance docket ${c.complaint_no} logged by ${c.name}`,
        type: "complaint"
      });
    });
  }
  if (courseLogs.data) {
    (courseLogs.data as CourseLog[]).forEach((cr) => {
      activities.push({
        time: new Date(cr.created_at),
        title: "Course Enrollment",
        desc: `${cr.full_name} enrolled for academy course`,
        type: "course"
      });
    });
  }
  if (certLogs.data) {
    (certLogs.data as CertificateLog[]).forEach((ce) => {
      activities.push({
        time: new Date(ce.created_at),
        title: "Certificate Issued",
        desc: `Certificate ${ce.certificate_no} issued to ${ce.user_name}`,
        type: "certificate"
      });
    });
  }
  if (payLogs.data) {
    (payLogs.data as PaymentLog[]).forEach((p) => {
      activities.push({
        time: new Date(p.created_at),
        title: "Payment Received",
        desc: `Payment of INR ${Number(p.amount)} completed (Txn: ${p.transaction_id})`,
        type: "payment"
      });
    });
  }

  const sortedActivities = activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "RESOLVED", "COMPLETED", "VALID"].includes(s)) {
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
    }
    if (["PENDING", "SUBMITTED"].includes(s)) {
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
    }
    if (["UNDER_REVIEW", "UNDER_INVESTIGATION", "IN_PROGRESS"].includes(s)) {
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20";
    }
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <FileCheck className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Dashboard Home
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Monitor membership, grievances, academy activity, payments, and the latest operational events.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>{sortedActivities.length} recent timeline events</span>
        </div>
      </div>
      
      {/* Global Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-none transition-colors duration-300">
        <form action="/admin/search" method="GET" className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            name="q"
            required
            placeholder="Global Search: Search by name, Ack number, enrollment ID, certificate number, or complaint docket..."
            className="w-full pl-4 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder-slate-400 dark:placeholder-slate-600"
          />
          <button type="submit" className="bg-[#001C55] dark:bg-blue-600 hover:bg-[#001236] dark:hover:bg-blue-500 text-white text-xs font-extrabold uppercase tracking-widest px-8 py-3 rounded-xl transition-all duration-300 cursor-pointer">
            Search
          </button>
        </form>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] block">Total Members</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">{totalMembers || 0}</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-500 font-extrabold mt-2 inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" /> {pendingMembers || 0} Pending
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform duration-300 border border-blue-100 dark:border-blue-500/20">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] block">Grievances Filed</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">{totalComplaints || 0}</span>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-extrabold mt-2 inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" /> {activeComplaints || 0} Active Cases
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform duration-300 border border-rose-100 dark:border-rose-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] block">Active Courses</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">{totalCourses || 0}</span>
            <span className="text-[10px] text-sky-700 dark:text-sky-400 font-extrabold mt-2 inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-lg">
               Academy CMS
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-105 transition-transform duration-300 border border-sky-100 dark:border-sky-500/20">
            <BookOpen className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] block">Enrollments</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-2 block tracking-tight">{totalEnrollments || 0}</span>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-extrabold mt-2 inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" /> Active Intake
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform duration-300 border border-indigo-100 dark:border-indigo-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none"></div>
          <div className="relative z-10">
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] block">Total Revenue</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-2 block tracking-tight">INR {totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold mt-2 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg shadow-sm dark:shadow-none border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" /> Fees Logged
            </span>
          </div>
          <div className="relative z-10 w-12 h-12 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md shadow-emerald-500/20">
            <IndianRupee className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left lists & Right timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/70">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Recent Membership requests</h3>
              <Link href="/admin/members" className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all tracking-wider flex items-center gap-1">
                Manage all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {!recentMembers || recentMembers.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 p-8 text-center italic font-medium">No membership records found.</p>
              ) : (
                recentMembers.map((member) => (
                  <div key={member.id} className="p-5 flex items-center justify-between text-sm hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all font-semibold text-slate-700 dark:text-slate-300 group">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{member.full_name}</h4>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">ACK: {member.ack_no}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-sm dark:shadow-none ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{new Date(member.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/70">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Recent Grievance Logs</h3>
              <Link href="/admin/complaints" className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all tracking-wider flex items-center gap-1">
                Review cases <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {!recentComplaints || recentComplaints.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 p-8 text-center italic font-medium">No grievances recorded.</p>
              ) : (
                recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="p-5 flex items-center justify-between text-sm hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all font-semibold text-slate-700 dark:text-slate-300 group">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">By: {complaint.name}</h4>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">Docket: {complaint.complaint_no}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-sm dark:shadow-none ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{new Date(complaint.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none h-fit sticky top-24">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            Live Activity Timeline
          </h3>
          {sortedActivities.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic font-medium">No activity logged yet.</p>
          ) : (
            <div className="relative pl-5 border-l-2 border-slate-100 dark:border-slate-800 space-y-7 text-sm text-left">
              {sortedActivities.map((act, i) => (
                <div key={i} className="relative group">
                  <span className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-900 ring-4 ring-slate-50 dark:ring-slate-950 shadow-sm transition-transform duration-300 group-hover:scale-125 ${
                    act.type === "payment" ? "bg-emerald-500 ring-emerald-50 dark:ring-emerald-500/20" :
                    act.type === "membership" ? "bg-sky-500 ring-sky-50 dark:ring-sky-500/20" :
                    act.type === "complaint" ? "bg-rose-500 ring-rose-50 dark:ring-rose-500/20" : "bg-cyan-500 ring-cyan-50 dark:ring-cyan-500/20"
                  }`} />
                  <div className="group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 dark:text-slate-200 font-extrabold text-xs">{act.title}</strong>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                        {act.time.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11.5px] mt-1.5 font-medium leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
