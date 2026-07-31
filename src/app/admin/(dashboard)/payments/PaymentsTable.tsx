"use client";

import React, { useMemo, useState } from "react";
import { Clock, ShieldCheck, Loader2, Search, Filter, ReceiptText, CheckCircle2, XCircle, Phone, Mail, Trash2 } from "lucide-react";
import { manuallyApprovePayment, deletePayment } from "./actions";
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
    mobile?: string | null;
    email?: string | null;
  } | null;
  course_registrations?: {
    full_name: string;
    enrollment_no?: string | null;
    mobile?: string | null;
    email?: string | null;
    courses?: {
      title: string;
    } | null;
  } | null;
  donations?: {
    donor_name: string;
    order_id: string;
    purpose: string;
    donor_mobile?: string | null;
    donor_email?: string | null;
  } | null;
  appreciation_applications?: {
    full_name: string;
    application_no: string;
    mobile?: string | null;
    email?: string | null;
  } | null;
};

interface PaymentsTableProps {
  initialPayments: PaymentLedgerRow[];
}

function getPaymentMeta(payment: PaymentLedgerRow) {
  if (payment.memberships) {
    return {
      payerName: payment.memberships.full_name,
      payerMobile: payment.memberships.mobile || "",
      payerEmail: payment.memberships.email || "",
      category: "Membership",
      reference: payment.memberships.ack_no
    };
  }

  if (payment.course_registrations) {
    return {
      payerName: payment.course_registrations.full_name,
      payerMobile: payment.course_registrations.mobile || "",
      payerEmail: payment.course_registrations.email || "",
      category: "Academy Course",
      reference: payment.course_registrations.courses?.title || payment.course_registrations.enrollment_no || "Course Fee"
    };
  }

  if (payment.donations) {
    return {
      payerName: payment.donations.donor_name,
      payerMobile: payment.donations.donor_mobile || "",
      payerEmail: payment.donations.donor_email || "",
      category: "Donation",
      reference: `${payment.donations.order_id} · ${payment.donations.purpose}`
    };
  }

  if (payment.appreciation_applications) {
    return {
      payerName: payment.appreciation_applications.full_name,
      payerMobile: payment.appreciation_applications.mobile || "",
      payerEmail: payment.appreciation_applications.email || "",
      category: "Appreciation Fee",
      reference: payment.appreciation_applications.application_no
    };
  }

  return {
    payerName: "Unknown Payer",
    payerMobile: "",
    payerEmail: "",
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

  const removePaymentById = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await deletePayment(id);
      if (res.success) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
        showToast("Payment record deleted successfully.", "success");
      } else {
        showToast(res.error || "Failed to delete payment record.", "error");
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error deleting payment.", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeletePayment = (id: string) => {
    requestConfirm({
      title: "Delete Payment Record",
      message: "Are you sure you want to permanently delete this payment transaction? Total ledger collections will recalculate automatically.",
      confirmLabel: "Yes, Delete Record",
      tone: "danger",
      onConfirm: () => removePaymentById(id)
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
        meta.payerMobile.toLowerCase().includes(query) ||
        meta.payerEmail.toLowerCase().includes(query) ||
        meta.category.toLowerCase().includes(query) ||
        meta.reference.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "ALL" || payment.status.toUpperCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const statusIcon = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED") return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
    if (s === "PENDING") return <Clock className="w-3 h-3 text-amber-600" />;
    return <XCircle className="w-3 h-3 text-rose-600" />;
  };

  return (
    <div className="space-y-4">
      {toast && <AdminToast message={toast.message} type={toast.type} />}

      {confirmDialog && (
        <AdminConfirmDialog
          isOpen={true}
          title={confirmDialog.title}
          description={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          tone={confirmDialog.tone}
          loading={confirming}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction ID, name, email, phone, category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#001C55]/20 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusFilters.map((status) => (
            <button
              key={status}
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
                      <td className="p-4">
                        <span className="text-slate-900 dark:text-slate-100 font-extrabold block">{meta.payerName}</span>
                        {meta.payerMobile && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {meta.payerMobile}
                          </span>
                        )}
                        {meta.payerEmail && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {meta.payerEmail}
                          </span>
                        )}
                      </td>
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
                        <div className="flex items-center justify-end gap-2">
                          {pay.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleManualVerify(pay.id)}
                              disabled={loadingId !== null}
                              className="px-3 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            >
                              {loadingId === pay.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              Verify
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(pay.id)}
                            disabled={loadingId !== null}
                            title="Delete Payment Record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 cursor-pointer disabled:opacity-50"
                          >
                            {loadingId === pay.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
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
