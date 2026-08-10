import React from "react";
import type { Prisma } from "@prisma/client";
import { CreditCard, CheckCircle2, Clock, ReceiptText } from "lucide-react";
import prisma from "@/lib/prisma";
import PaymentsTable from "./PaymentsTable";

export const dynamic = "force-dynamic";

const paymentLedgerInclude = {
  memberships: {
    select: {
      full_name: true,
      ack_no: true,
      mobile: true,
      email: true
    }
  },
  course_registrations: {
    select: {
      full_name: true,
      enrollment_no: true,
      mobile: true,
      email: true,
      courses: {
        select: {
          title: true
        }
      }
    }
  },
  donations: {
    select: {
      donor_name: true,
      donor_mobile: true,
      donor_email: true,
      order_id: true,
      purpose: true
    }
  },
  appreciation_applications: {
    select: {
      full_name: true,
      application_no: true,
      mobile: true,
      email: true
    }
  }
} satisfies Prisma.paymentsInclude;

export type PaymentLedgerItem = Prisma.paymentsGetPayload<{
  include: typeof paymentLedgerInclude;
}>;

export default async function AdminPaymentsPage() {
  // Fetch all payment transactions using Prisma with Supabase REST fallback
  let payments: any[] = [];
  try {
    payments = await prisma.payments.findMany({
      orderBy: { created_at: "desc" },
      include: paymentLedgerInclude
    });
  } catch (error) {
    console.error("Prisma pooler connection error, falling back to Supabase client:", error);
    try {
      const { cookies } = await import("next/headers");
      const { createClient } = await import("@/utils/supabase/server");
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data: supaData } = await supabase
        .from("payments")
        .select(`
          *,
          memberships ( full_name, ack_no, mobile, email ),
          course_registrations ( full_name, enrollment_no, mobile, email, courses ( title ) ),
          donations ( donor_name, donor_mobile, donor_email, order_id, purpose ),
          appreciation_applications ( full_name, application_no, mobile, email )
        `)
        .order("created_at", { ascending: false });

      if (supaData) {
        payments = supaData;
      }
    } catch (supaErr) {
      console.error("Error in Supabase payments fallback:", supaErr);
    }
  }

  // Merge dev store affiliation payments in dev mode
  try {
    const { getDevAffiliations } = await import("@/lib/affiliation-dev-store");
    const devAffs = getDevAffiliations();
    const devPayments = devAffs
      .filter((d) => d.payment)
      .map((d) => ({
        id: `DEV-${d.id}`,
        transaction_id: d.payment?.transactionId || d.id,
        gateway_transaction_id: d.payment?.gatewayTransactionId || d.payment?.transactionId,
        amount: d.payment?.amount || 2100,
        currency: d.payment?.currency || "INR",
        status: d.payment?.status || "PENDING",
        created_at: d.createdAt,
        paid_at: d.payment?.paidAt,
        receipt_no: d.payment?.receiptNo,
        appreciation_applications: null,
        memberships: null,
        course_registrations: null,
        donations: null,
        affiliations: {
          organization_name: d.organizationName,
          application_no: d.applicationNo
        }
      }));

    if (devPayments.length > 0) {
      // Filter out duplicate transaction IDs if present in DB
      const existingTxnIds = new Set(payments.map((p) => p.transaction_id || p.id));
      const newDevPayments = devPayments.filter((p) => !existingTxnIds.has(p.transaction_id));
      payments = [...newDevPayments, ...payments];
    }
  } catch (_) {}

  const list = payments || [];
  const totalCompleted = list
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const totalPending = list
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <CreditCard className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Payments & Fee Ledger
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Audit portal fee collections, track pending payments, and view transaction records.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <ReceiptText className="w-3.5 h-3.5" />
          <span>{list.length} ledger entries</span>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] block">Total Collections</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">INR {totalCompleted.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] block">Pending Collections</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">INR {totalPending.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Client Payments Table */}
      <PaymentsTable initialPayments={payments} />

    </div>
  );
}
