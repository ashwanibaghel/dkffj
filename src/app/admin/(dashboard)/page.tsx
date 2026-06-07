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
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-800">Administrative Shell Control</h1>
        <p className="text-slate-500 text-xs mt-1">Real-time metrics, records management, and audit desk for DKFFJ Portal.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Total Members */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Members</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalMembers || 0}</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {pendingMembers || 0} Pending
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Complaints / Violations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievances Filed</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalComplaints || 0}</span>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {activeComplaints || 0} Active Cases
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Courses</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalCourses || 0}</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">Academy CMS</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Course Enrollments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrollments</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{totalEnrollments || 0}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active Intake
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Revenue Ledger */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-lg sm:text-xl font-black text-[#D62828] mt-1 block">INR {totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fees Logged
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Lists Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Members Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Membership Enrollment Requests</h3>
            <Link href="/admin/members" className="text-[10px] font-bold text-[#0F4C81] hover:underline uppercase tracking-wider flex items-center gap-0.5">
              Manage all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {!recentMembers || recentMembers.length === 0 ? (
              <p className="text-xs text-slate-450 p-6 text-center italic">No membership records found.</p>
            ) : (
              recentMembers.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-all">
                  <div>
                    <h4 className="font-bold text-slate-800">{member.full_name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">ACK: {member.ack_no}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(member.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Grievances Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Grievance Logs</h3>
            <Link href="/admin/complaints" className="text-[10px] font-bold text-[#0F4C81] hover:underline uppercase tracking-wider flex items-center gap-0.5">
              Review cases <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {!recentComplaints || recentComplaints.length === 0 ? (
              <p className="text-xs text-slate-450 p-6 text-center italic">No grievances recorded.</p>
            ) : (
              recentComplaints.map((complaint) => (
                <div key={complaint.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-all">
                  <div>
                    <h4 className="font-bold text-slate-800">By: {complaint.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Docket: {complaint.complaint_no}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(complaint.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
