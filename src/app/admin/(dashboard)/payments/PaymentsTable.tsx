"use client";

import React, { useMemo, useState } from "react";
import { Clock, ShieldCheck, Loader2, Search, Filter, ReceiptText, CheckCircle2, XCircle } from "lucide-react";
import { manuallyApprovePayment } from "./actions";
import { AdminConfirmDialog, AdminToast, useAdminFeedback } from "../components/AdminFeedback";
import AdminEmptyState from "../components/AdminEmptyState";

type PaymentLedgerRow = {
  id: string;
  amount: number | string;
  transaction_id: string;
  gateway: string;
  gateway_transaction_id?: string | null;
  status: string;
  created_at: Date | string;
  memberships?: {
    full_name: string;
    ack_no: string;
  } | null;
  course_registrations?: {
    full_name: string;
    enrollment_no?: string | null;
    courses?: {
      title: string;
    } | null;
  } | null;
  donations?: {
    donor_name: string;
    order_id: string;
    purpose: string;
  } | null;
};

interface PaymentsTableProps {
  initialPayments: PaymentLedgerRow[];
}

function getPaymentMeta(payment: PaymentLedgerRow) {
  if (payment.memberships) {
    return {
      payerName: payment.memberships.full_name,
      category: "Membership",
      reference: payment.memberships.ack_no
    };
  }

  if (payment.course_registrations) {
    return {
      payerName: payment.course_registrations.full_name,
      category: "Academy Course",
      reference: payment.course_registrations.courses?.title || payment.course_registrations.enrollment_no || "Course Fee"
    };
  }

  if (payment.donations) {
    return {
      payerName: payment.donations.donor_name,
      category: "Donation",
      reference: `${payment.donations.order_id} · ${payment.donations.purpose}`
    };
  }

  return {
    payerName: "Unknown Payer",
    category: "General Fee",
    reference: payment.gateway_transaction_id || payment.transaction_id
  };
}

export default function PaymentsTable({ initialPayments }: PaymentsTableProps) {
  const [payments, setPayments] = useState<PaymentLedgerRow[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { toast, showToast, confirmDialog, requestConfirm, closeConfirm, handleConfirm, confirming } = useAdminFeedback();

  const verifyPaymentById = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await manuallyApprovePayment(id);
      if (res.success) {
        // Update local state
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "COMPLETED" } : p))
        );
        showToast("Payment verified and completed successfully.");
      } else {
        showToast(res.error || "Failed to approve payment.", "error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred.";
      showToast(message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleManualVerify = (id: string) => {
    requestConfirm({
      title: "Verify payment manually?",
      message: "This will approve the application and send the receipt email.",
      confirmLabel: "Verify",
      tone: "primary",
      onConfirm: () => verifyPaymentById(id)
    });
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED") return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20";
    if (s === "PENDING") return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20";
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20";
  };

  const statusFilters = ["ALL", "COMPLETED", "PENDING", "FAILED"];

  const statusCounts = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        const status = payment.status.toUpperCase();
        acc.ALL += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [payments]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return payments.filter((payment) => {
      const meta = getPaymentMeta(payment);
      const matchesSearch =
        query === "" ||
        payment.transaction_id.toLowerCase().includes(query) ||
        payment.gateway.toLowerCase().includes(query) ||
        meta.payerName.toLowerCase().includes(query) ||
        meta.category.toLowerCase().includes(query) ||
        meta.reference.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "ALL" || payment.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const statusIcon = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "COMPLETED") return <CheckCircle2 className="w-3 h-3" />;
    if (normalized === "PENDING") return <Clock className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />
      <AdminConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        tone={confirmDialog?.tone}
        loading={confirming}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statusFilters.map((status) => {
          const isActive = statusFilter === status;
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                {status === "ALL" ? "All Payments" : status}
              </span>
              <span className="block text-2xl font-black mt-2 tracking-tight">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 lg:items-center justify-between shadow-sm dark:shadow-none">
        <div className="relative w-full lg:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === status
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {status === "ALL" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/70 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.14em] flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-[#001C55] dark:text-blue-400" />
            Transaction History Logs
          </h3>
          <span className="text-[10px] bg-[#1565C0]/10 text-[#1565C0] dark:text-blue-300 font-extrabold px-2 py-0.5 rounded uppercase">
            Showing {filtered.length} entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-950/70 text-slate-400 dark:text-slate-500 border-b border-slate-200/60 dark:border-slate-800 font-black uppercase tracking-[0.14em] text-[9px]">
                <th className="p-4">Transaction</th>
                <th className="p-4">Payer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <AdminEmptyState
                      icon={ReceiptText}
                      title="No transactions visible"
                      description="No payment records match the current search or status filter. Try another status or search by transaction, payer, or category."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => {
                  const meta = getPaymentMeta(pay);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-slate-900 dark:text-slate-100 block">{pay.transaction_id}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black mt-1 block">{pay.gateway}</span>
                      </td>
                      <td className="p-4 text-slate-900 dark:text-slate-100 font-extrabold">{meta.payerName}</td>
                      <td className="p-4">
                        <span className="text-slate-700 dark:text-slate-200 font-bold block">{meta.category}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 max-w-[260px] truncate">{meta.reference}</span>
                      </td>
                      <td className="p-4 text-[#C00000] dark:text-rose-300 font-black">INR {Number(pay.amount).toLocaleString("en-IN")}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] border ${getStatusBadge(pay.status)}`}>
                          {statusIcon(pay.status)}
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] text-slate-400 dark:text-slate-500">{new Date(pay.created_at).toLocaleString("en-IN")}</td>
                      <td className="p-4 text-right">
                        {pay.status === "PENDING" ? (
                          <button
                            type="button"
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
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic font-medium pr-2">No actions</span>
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
