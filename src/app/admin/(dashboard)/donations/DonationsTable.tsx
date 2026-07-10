"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Clock, Filter, HeartHandshake, ReceiptText, Search, XCircle } from "lucide-react";

export type DonationLedgerItem = {
  id: string;
  order_id: string;
  transaction_id?: string | null;
  donor_name: string;
  donor_email: string;
  donor_mobile: string;
  donor_address: string;
  amount: number;
  purpose: string;
  status: string;
  created_at: string;
};

type DonationsTableProps = {
  initialDonations: DonationLedgerItem[];
};

export default function DonationsTable({ initialDonations }: DonationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const statusFilters = ["ALL", "COMPLETED", "PENDING", "FAILED"];

  const statusCounts = useMemo(() => {
    return initialDonations.reduce(
      (acc, donation) => {
        const status = donation.status.toUpperCase();
        acc.ALL += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [initialDonations]);

  const filteredDonations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialDonations.filter((donation) => {
      const matchesStatus = statusFilter === "ALL" || donation.status.toUpperCase() === statusFilter;
      const matchesSearch =
        query === "" ||
        donation.order_id.toLowerCase().includes(query) ||
        (donation.transaction_id || "").toLowerCase().includes(query) ||
        donation.donor_name.toLowerCase().includes(query) ||
        donation.donor_email.toLowerCase().includes(query) ||
        donation.donor_mobile.toLowerCase().includes(query) ||
        donation.purpose.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [initialDonations, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED") {
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20";
    }
    if (s === "PENDING") {
      return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20";
    }
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20";
  };

  const statusIcon = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "COMPLETED") return <CheckCircle2 className="w-3 h-3" />;
    if (normalized === "PENDING") return <Clock className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
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
                {status === "ALL" ? "All Donations" : status}
              </span>
              <span className="block text-2xl font-black mt-2 tracking-tight">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 lg:items-center justify-between shadow-sm dark:shadow-none">
        <div className="relative w-full lg:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search donor, receipt, mobile, purpose..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/70 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.14em] flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Donation Transaction History
          </h3>
          <span className="text-[10px] bg-[#1565C0]/10 text-[#1565C0] dark:text-blue-300 font-extrabold px-2 py-0.5 rounded uppercase">
            Showing {filteredDonations.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-950/70 text-slate-400 dark:text-slate-500 border-b border-slate-200/60 dark:border-slate-800 font-black uppercase tracking-[0.14em] text-[9px]">
                <th className="p-4">Receipt</th>
                <th className="p-4">Donor</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                    No donation records match filters.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-slate-900 dark:text-slate-100 block">{donation.order_id}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {donation.transaction_id || "Gateway reference pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">{donation.donor_name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{donation.donor_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 dark:text-slate-200">{donation.donor_mobile}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-xs">{donation.donor_address}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-500/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide">
                        <ReceiptText className="w-3 h-3" />
                        {donation.purpose}
                      </span>
                    </td>
                    <td className="p-4 text-[#C00000] dark:text-rose-300 font-black">
                      INR {donation.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] border ${getStatusBadge(donation.status)}`}>
                        {statusIcon(donation.status)}
                        {donation.status}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-slate-400 dark:text-slate-500">{new Date(donation.created_at).toLocaleString("en-IN")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
