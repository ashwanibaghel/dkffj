import React from "react";
import type { donations } from "@prisma/client";
import { Heart, IndianRupee, ReceiptText, User } from "lucide-react";
import prisma from "@/lib/prisma";
import DonationsTable, { type DonationLedgerItem } from "./DonationsTable";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  // Fetch all donations using Prisma to bypass RLS
  let donations: donations[] = [];
  try {
    donations = await prisma.donations.findMany({
      orderBy: { created_at: "desc" }
    });
  } catch (error) {
    console.error("Error fetching donations via Prisma:", error);
  }

  const list = donations || [];
  const serializedDonations: DonationLedgerItem[] = list.map((donation) => ({
    id: donation.id,
    order_id: donation.order_id,
    transaction_id: donation.transaction_id,
    donor_name: donation.donor_name,
    donor_email: donation.donor_email,
    donor_mobile: donation.donor_mobile,
    donor_address: donation.donor_address,
    amount: Number(donation.amount),
    purpose: donation.purpose,
    status: donation.status,
    created_at: donation.created_at.toISOString()
  }));

  const totalCompleted = list
    .filter((d) => d.status === "COMPLETED")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalCount = list.filter((d) => d.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Heart className="w-5 h-5 text-rose-500 fill-current" /> Donations Desk
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">View list of contributors, track donation purposes, and inspect transaction logs.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <ReceiptText className="w-3.5 h-3.5" />
          <span>{list.length} donation records</span>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] block">Total Donations Collected</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">INR {totalCompleted.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em] block">Successful Contributors</span>
            <span className="text-xl sm:text-2xl font-black text-[#001C55] dark:text-blue-300 mt-1 block">{totalCount} Donors</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#001C55] dark:text-blue-300">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      <DonationsTable initialDonations={serializedDonations} />
    </div>
  );
}
