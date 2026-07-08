import React from "react";
import { Heart, IndianRupee, Clock, CheckCircle2, User } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  // Fetch all donations using Prisma to bypass RLS
  let donations: any[] = [];
  try {
    donations = await prisma.donations.findMany({
      orderBy: { created_at: "desc" }
    });
  } catch (error) {
    console.error("Error fetching donations via Prisma:", error);
  }

  const list = donations || [];
  const totalCompleted = list
    .filter((d) => d.status === "COMPLETED")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const totalCount = list.filter((d) => d.status === "COMPLETED").length;

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
          <Heart className="w-5 h-5 text-rose-500 fill-current" /> Donations Desk
        </h1>
        <p className="text-slate-500 text-xs mt-1">View list of contributors, track donation purposes, and inspect transaction logs.</p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Donations Collected</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">INR {totalCompleted.toLocaleString("en-IN")}.00</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Successful Contributors</span>
            <span className="text-xl sm:text-2xl font-black text-[#001C55] mt-1 block">{totalCount} Donors</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#001C55]">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Donation Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 border-b border-slate-200/60 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-4">Reference ID</th>
                <th className="p-4">Donor Details</th>
                <th className="p-4">Mobile & Address</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic">No donation records found.</td>
                </tr>
              ) : (
                list.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-slate-900">{don.order_id}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{don.donor_name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{don.donor_email}</div>
                    </td>
                    <td className="p-4">
                      <div>{don.donor_mobile}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{don.donor_address}</div>
                    </td>
                    <td className="p-4 text-slate-500 uppercase tracking-wide text-[10px]">{don.purpose}</td>
                    <td className="p-4 text-[#C00000] font-bold">INR {Number(don.amount)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] border ${getStatusBadge(don.status)}`}>
                        {don.status}
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-slate-400">{new Date(don.created_at).toLocaleString("en-IN")}</td>
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
