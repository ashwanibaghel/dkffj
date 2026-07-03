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

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch Stats Aggregates
  const { count: totalMembers } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true });

  const { count: pendingMembers } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING");

  const { count: totalComplaints } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true });

  const { count: activeComplaints } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true })
    .in("status", ["SUBMITTED", "UNDER_INVESTIGATION", "IN_PROGRESS"]);

  const { count: totalCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: totalEnrollments } = await supabase
    .from("course_registrations")
    .select("*", { count: "exact", head: true });

  // 2. Fetch completed payment total
  const { data: paymentData } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "COMPLETED");
  
  const totalRevenue = paymentData?.reduce((acc, pay) => acc + Number(pay.amount), 0) || 0;

  // 3. Fetch 5 Recent Complaints
  const { data: recentComplaints } = await supabase
    .from("complaints")
    .select("id, complaint_no, name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // 4. Fetch 5 Recent Memberships
  const { data: recentMembers } = await supabase
    .from("memberships")
    .select("id, ack_no, membership_no, full_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // 5. Fetch logs for Activity Timeline
  const [membersLogs, complaintsLogs, courseLogs, certLogs, payLogs] = await Promise.all([
    supabase.from("memberships").select("full_name, ack_no, created_at, status").order("created_at", { ascending: false }).limit(5),
    supabase.from("complaints").select("name, complaint_no, created_at, status").order("created_at", { ascending: false }).limit(5),
    supabase.from("course_registrations").select("full_name, enrollment_no, created_at, status").order("created_at", { ascending: false }).limit(5),
    supabase.from("certificates").select("user_name, certificate_no, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("amount, transaction_id, created_at").eq("status", "COMPLETED").order("created_at", { ascending: false }).limit(5),
  ]);

  const activities: any[] = [];
  if (membersLogs.data) {
    membersLogs.data.forEach((m: any) => {
      activities.push({
        time: new Date(m.created_at),
        title: "Membership Applied",
        desc: `${m.full_name} submitted form (${m.ack_no})`,
        type: "membership"
      });
    });
  }
  if (complaintsLogs.data) {
    complaintsLogs.data.forEach((c: any) => {
      activities.push({
        time: new Date(c.created_at),
        title: "Complaint Filed",
        desc: `Grievance docket ${c.complaint_no} logged by ${c.name}`,
        type: "complaint"
      });
    });
  }
  if (courseLogs.data) {
    courseLogs.data.forEach((cr: any) => {
      activities.push({
        time: new Date(cr.created_at),
        title: "Course Enrollment",
        desc: `${cr.full_name} enrolled for academy course`,
        type: "course"
      });
    });
  }
  if (certLogs.data) {
    certLogs.data.forEach((ce: any) => {
      activities.push({
        time: new Date(ce.created_at),
        title: "Certificate Issued",
        desc: `Certificate ${ce.certificate_no} issued to ${ce.user_name}`,
        type: "certificate"
      });
    });
  }
  if (payLogs.data) {
    payLogs.data.forEach((p: any) => {
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
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    }
    if (["PENDING", "SUBMITTED"].includes(s)) {
      return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    }
    if (["UNDER_REVIEW", "UNDER_INVESTIGATION", "IN_PROGRESS"].includes(s)) {
      return "bg-sky-500/10 text-sky-700 border-sky-500/20";
    }
    return "bg-rose-500/10 text-rose-700 border-rose-500/20";
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">Administrative Shell Control</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time metrics, records management, and audit desk for DKFFJ Portal.</p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <form action="/admin/search" method="GET" className="flex gap-2">
          <input 
            type="text" 
            name="q"
            required
            placeholder="Global Search: Search by name, Ack number, enrollment ID, certificate number, or complaint docket..."
            className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#001C55] transition-all font-semibold"
          />
          <button type="submit" className="bg-[#001C55] hover:bg-[#001236] text-white text-xs font-bold uppercase tracking-wider px-6 rounded-xl transition-all cursor-pointer">
            Search
          </button>
        </form>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalMembers || 0}</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {pendingMembers || 0} Pending
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#001C55]/10 flex items-center justify-center text-[#001C55] shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievances Filed</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalComplaints || 0}</span>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {activeComplaints || 0} Active Cases
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Courses</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalCourses || 0}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">Academy CMS</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrollments</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalEnrollments || 0}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active Intake
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-lg sm:text-xl font-black text-[#C00000] mt-1 block">INR {totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fees Logged
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left lists & Right timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Membership requests</h3>
              <Link href="/admin/members" className="text-[10px] font-bold text-[#001C55] hover:underline uppercase tracking-wider flex items-center gap-0.5">
                Manage all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {!recentMembers || recentMembers.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center italic">No membership records found.</p>
              ) : (
                recentMembers.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-all font-semibold text-slate-700">
                    <div>
                      <h4 className="font-bold text-slate-800">{member.full_name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">ACK: {member.ack_no}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(member.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Grievance Logs</h3>
              <Link href="/admin/complaints" className="text-[10px] font-bold text-[#001C55] hover:underline uppercase tracking-wider flex items-center gap-0.5">
                Review cases <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {!recentComplaints || recentComplaints.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 text-center italic">No grievances recorded.</p>
              ) : (
                recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-all font-semibold text-slate-700">
                    <div>
                      <h4 className="font-bold text-slate-800">By: {complaint.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Docket: {complaint.complaint_no}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(complaint.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">
            Live Activity Timeline
          </h3>
          {sortedActivities.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No activity logged yet.</p>
          ) : (
            <div className="relative pl-4 border-l border-slate-150 space-y-6 text-xs text-left">
              {sortedActivities.map((act, i) => (
                <div key={i} className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ring-slate-100 ${
                    act.type === "payment" ? "bg-emerald-500" :
                    act.type === "membership" ? "bg-sky-500" :
                    act.type === "complaint" ? "bg-purple-500" : "bg-cyan-500"
                  }`} />
                  <div>
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-800 font-bold text-[11px]">{act.title}</strong>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {act.time.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px] mt-0.5 font-medium leading-relaxed">{act.desc}</p>
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
