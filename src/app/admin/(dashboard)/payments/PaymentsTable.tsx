"use client";

import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Clock, ShieldCheck, Loader2, Search, Filter } from "lucide-react";
import { manuallyApprovePayment } from "./actions";

interface PaymentsTableProps {
  initialPayments: any[];
}

export default function PaymentsTable({ initialPayments }: PaymentsTableProps) {
  const [payments, setPayments] = useState<any[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleManualVerify = async (id: string) => {
    if (!confirm("Are you sure you want to verify this payment manually? This will approve the application and send the receipt email.")) {
      return;
    }
    setLoadingId(id);
    try {
      const res = await manuallyApprovePayment(id);
      if (res.success) {
        // Update local state
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "COMPLETED" } : p))
        );
        alert("Payment verified and completed successfully.");
      } else {
        alert(res.error || "Failed to approve payment.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "PENDING") return "bg-amber-50 text-amber-705 border-amber-250";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  // Filter & Search logic
  const filtered = payments.filter((pay) => {
    let payerName = "Unknown Payer";
    let category = "General Fee";

    if (pay.memberships) {
      payerName = pay.memberships.full_name;
      category = `Membership (${pay.memberships.ack_no})`;
    } else if (pay.course_registrations) {
      payerName = pay.course_registrations.full_name;
      category = `Academy: ${pay.course_registrations.courses?.title || "Course Fee"}`;
    } else if (pay.donations) {
      payerName = pay.donations.donor_name;
      category = `Donation (${pay.donations.order_id}): ${pay.donations.purpose}`;
    }

    const matchesSearch =
      pay.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || pay.status.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-slate-400 text-xs font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg py-1.5 px-3 text-xs bg-slate-50 focus:outline-none font-semibold text-slate-700"
          >
            <option value="ALL">All Payments</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Transaction History Logs</h3>
          <span className="text-[10px] bg-[#1565C0]/10 text-[#1565C0] font-extrabold px-2 py-0.5 rounded uppercase">
            Showing {filtered.length} entries
          </span>
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
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">No transaction records match filters.</td>
                </tr>
              ) : (
                filtered.map((pay) => {
                  let payerName = "Unknown Payer";
                  let category = "General Fee";

                  if (pay.memberships) {
                    payerName = pay.memberships.full_name;
                    category = `Membership (${pay.memberships.ack_no})`;
                  } else if (pay.course_registrations) {
                    payerName = pay.course_registrations.full_name;
                    category = `Academy: ${pay.course_registrations.courses?.title || "Course Fee"}`;
                  } else if (pay.donations) {
                    payerName = pay.donations.donor_name;
                    category = `Donation (${pay.donations.order_id})`;
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
                      <td className="p-4 text-right">
                        {pay.status === "PENDING" ? (
                          <button
                            onClick={() => handleManualVerify(pay.id)}
                            disabled={loadingId !== null}
                            className="px-3 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            {loadingId === pay.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-3 h-3" />
                            )}
                            Verify Manually
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-medium pr-2">No actions</span>
                        )}
                      </td>
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
