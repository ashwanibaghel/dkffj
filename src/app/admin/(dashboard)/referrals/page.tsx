"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  getReferralStats, 
  getReferrerList, 
  getReferredMembersDetail, 
  ReferrerStats, 
  ReferredMemberDetail 
} from "./actions";
import { 
  Users, 
  Search, 
  Eye, 
  Loader2, 
  AlertCircle, 
  Award, 
  Share2, 
  X, 
  UserCheck, 
  Clock 
} from "lucide-react";

export default function AdminReferralsPage() {
  const [stats, setStats] = useState({ totalReferred: 0, totalDirect: 0, uniqueReferrers: 0 });
  const [referrers, setReferrers] = useState<ReferrerStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Detail modal states
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerStats | null>(null);
  const [referredDetails, setReferredDetails] = useState<ReferredMemberDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsData, listData] = await Promise.all([
        getReferralStats(),
        getReferrerList()
      ]);
      setStats(statsData);
      setReferrers(listData);
    } catch (err) {
      console.error("Failed to load referral data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch referred members detail when a referrer is clicked
  async function handleViewReferrals(referrer: ReferrerStats) {
    setSelectedReferrer(referrer);
    setLoadingDetails(true);
    try {
      const details = await getReferredMembersDetail(referrer.id);
      setReferredDetails(details);
    } catch (err) {
      console.error("Failed to fetch referred details:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Filter referrers list based on search query
  const filteredReferrers = useMemo(() => {
    if (!searchQuery.trim()) return referrers;
    const query = searchQuery.toLowerCase().trim();
    return referrers.filter(
      (r) => 
        r.name.toLowerCase().includes(query) || 
        r.membershipNo.toLowerCase().includes(query)
    );
  }, [referrers, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNDER_REVIEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 text-left p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 font-serif">Referrals Desk</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track volunteer growth, monitor referral sources, and attribute member growth to sponsors.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
        </div>
      ) : (
        <>
          {/* KPI Widget Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#1565C0]">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Referred Joins</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalReferred}</span>
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Joins</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalDirect}</span>
              </div>
            </div>

            <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unique Referrers</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.uniqueReferrers}</span>
              </div>
            </div>
          </div>

          {/* Search bar & main Referrers Table */}
          <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-bold text-slate-800 font-serif">Referrer Leaderboard</h3>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Referrer by name or ID..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]/10 focus:border-[#1565C0] bg-slate-50/50"
                />
              </div>
            </div>

            {filteredReferrers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-xl bg-slate-50/50">
                <AlertCircle className="w-8 h-8 text-slate-355 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No referrers match your search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Referrer Name</th>
                      <th className="py-3 px-4">Member ID</th>
                      <th className="py-3 px-4 text-center">Total Referred</th>
                      <th className="py-3 px-4 text-center">Approved</th>
                      <th className="py-3 px-4 text-center">Pending</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrers.map((referrer) => (
                      <tr key={referrer.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{referrer.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{referrer.membershipNo}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#1565C0]">{referrer.totalReferred}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{referrer.approvedCount}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-amber-500">{referrer.pendingCount}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleViewReferrals(referrer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-100 rounded-lg text-[10px] font-bold text-[#1565C0] bg-sky-50/30 hover:bg-sky-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Referred
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Referrals Detail Drawer Modal */}
      {selectedReferrer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fadeIn">
          <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl p-6 relative overflow-hidden animate-slideLeft">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[9px] font-bold text-[#1565C0] bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase tracking-wider block w-fit">
                  Referral Details
                </span>
                <h3 className="text-md font-bold text-slate-800 font-serif mt-2">
                  Referred by {selectedReferrer.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  ID: {selectedReferrer.membershipNo}
                </p>
              </div>
              <button 
                onClick={() => setSelectedReferrer(null)}
                className="p-1 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1565C0]" />
                </div>
              ) : referredDetails.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center">No referred members found.</p>
              ) : (
                <div className="space-y-3">
                  {referredDetails.map((member) => (
                    <div 
                      key={member.id} 
                      className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: {member.membershipNo || member.ackNo}
                        </p>
                        <span className="text-[9px] text-slate-400 block">
                          Joined on: {new Date(member.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded border font-bold text-[9px] uppercase ${getStatusBadge(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary */}
            <div className="border-t pt-4 flex justify-between text-xs text-slate-500 font-semibold">
              <span>Total Referred: {selectedReferrer.totalReferred}</span>
              <span className="text-emerald-600">Approved: {selectedReferrer.approvedCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
