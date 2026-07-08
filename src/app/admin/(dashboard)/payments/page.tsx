import React from "react";
import { CreditCard, CheckCircle2, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import PaymentsTable from "./PaymentsTable";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  // Fetch all payment transactions using Prisma to bypass RLS
  let payments: any[] = [];
  try {
    payments = await prisma.payments.findMany({
      orderBy: { created_at: "desc" },
      include: {
        memberships: {
          select: {
            full_name: true,
            ack_no: true
          }
        },
        course_registrations: {
          include: {
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
            order_id: true,
            purpose: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching payments ledger via Prisma:", error);
  }

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

      {/* Interactive Client Payments Table */}
      <PaymentsTable initialPayments={payments} />

    </div>
  );
}
