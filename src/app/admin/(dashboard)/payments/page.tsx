import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { CreditCard, IndianRupee, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all payment transactions
  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      *,
      memberships (
        full_name,
        ack_no
      ),
      course_registrations (
        full_name,
        enrollment_no,
        courses (
          title
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments ledger:", error);
  }

  const list = payments || [];
  const totalCompleted = list
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const totalPending = list
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "PENDING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#001C55]" /> Payments & Fee Ledger
        </h1>
        <p className="text-slate-500 text-xs mt-1">Audit portal fee collections, track pending payments, and view transaction records.</p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Collections</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">INR {totalCompleted.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Collections</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">INR {totalPending.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction History Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 border-b border-slate-200/60 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Applicant / Student</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">No transaction records found.</td>
                </tr>
              ) : (
                list.map((pay) => {
                  let payerName = "Unknown Payer";
                  let category = "General Fee";

                  if (pay.memberships) {
                    payerName = pay.memberships.full_name;
                    category = `Membership (${pay.memberships.ack_no})`;
                  } else if (pay.course_registrations) {
                    payerName = pay.course_registrations.full_name;
                    category = `Academy: ${pay.course_registrations.courses?.title || "Course Fee"}`;
                  }

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono text-slate-900">{pay.transaction_id}</td>
                      <td className="p-4">{payerName}</td>
                      <td className="p-4 text-slate-500">{category}</td>
                      <td className="p-4 text-[#C00000] font-bold">INR {Number(pay.amount)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] border ${getStatusBadge(pay.status)}`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400">{new Date(pay.created_at).toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
