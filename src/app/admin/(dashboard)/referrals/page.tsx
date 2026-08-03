"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  getReferralStats, 
  getReferrerList, 
  getReferrerDetails, 
  ReferrerStats, 
  ReferredMemberDetail,
  ReferredAppreciationDetail
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
  Clock,
  Sparkles,
  FileCheck2,
  Ribbon
} from "lucide-react";

export default function AdminReferralsPage() {
  const [stats, setStats] = useState({
    totalMembershipReferred: 0,
    totalAppreciationReferred: 0,
    totalCombinedReferred: 0,
    uniqueReferrers: 0
  });
  const [referrers, setReferrers] = useState<ReferrerStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "MEMBERSHIP" | "APPRECIATION">("ALL");
  const [loading, setLoading] = useState(true);
  
  // Detail modal states
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerStats | null>(null);
  const [detailTab, setDetailTab] = useState<"MEMBERSHIP" | "APPRECIATION">("MEMBERSHIP");
  const [membershipDetails, setMembershipDetails] = useState<ReferredMemberDetail[]>([]);
  const [appreciationDetails, setAppreciationDetails] = useState<ReferredAppreciationDetail[]>([]);
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

  // Fetch referred details when a referrer is clicked
  async function handleViewReferrals(referrer: ReferrerStats) {
    setSelectedReferrer(referrer);
    setDetailTab(referrer.membershipTotal > 0 ? "MEMBERSHIP" : "APPRECIATION");
    setLoadingDetails(true);
    try {
      const details = await getReferrerDetails(referrer.id);
      setMembershipDetails(details.memberships);
      setAppreciationDetails(details.appreciations);
    } catch (err) {
      console.error("Failed to fetch referrer details:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Filter referrers list based on tab & search query
  const filteredReferrers = useMemo(() => {
    let result = referrers;

    if (activeTab === "MEMBERSHIP") {
      result = result.filter((r) => r.membershipTotal > 0);
    } else if (activeTab === "APPRECIATION") {
      result = result.filter((r) => r.appreciationTotal > 0);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) => 
          r.name.toLowerCase().includes(query) || 
          r.membershipNo.toLowerCase().includes(query)
      );
    }

    return result;
  }, [referrers, activeTab, searchQuery]);

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
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 font-serif">Referrals Analytics Desk</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track volunteer member activity, monitor referral sources, and attribute member & appreciation growth to sponsors.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
        </div>
      ) : (
        <>
          {/* KPI Widget Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Combined */}
            <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-[#1565C0]">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Combined Referrals</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalCombinedReferred}</span>
              </div>
            </div>

            {/* Membership Referrals */}
            <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Membership Referrals</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalMembershipReferred}</span>
              </div>
            </div>

            {/* Appreciation Referrals */}
            <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Ribbon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Appreciation Referrals</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalAppreciationReferred}</span>
              </div>
            </div>

            {/* Unique Active Referrers */}
            <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unique Referrers</span>
                <span className="text-2xl font-black text-slate-800 mt-0.5">{stats.uniqueReferrers}</span>
              </div>
            </div>

          </div>

          {/* Filter Tabs & Main Table */}
          <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              
              {/* Category Filter Tabs */}
              <div className="flex bg-slate-100/70 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "ALL" 
                      ? "bg-[#1565C0] text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Referrers ({referrers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("MEMBERSHIP")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "MEMBERSHIP" 
                      ? "bg-[#1565C0] text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Membership Referrers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("APPRECIATION")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "APPRECIATION" 
                      ? "bg-[#1565C0] text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Appreciation Referrers
                </button>
              </div>

              {/* Search input */}
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
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No referrers match the selected category or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Referrer Name</th>
                      <th className="py-3 px-4">Member ID</th>
                      <th className="py-3 px-4 text-center">Membership Referrals</th>
                      <th className="py-3 px-4 text-center">Appreciation Referrals</th>
                      <th className="py-3 px-4 text-center">Total Combined</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrers.map((referrer) => (
                      <tr key={referrer.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{referrer.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{referrer.membershipNo}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-indigo-600">{referrer.membershipTotal}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({referrer.membershipApproved} Approved)</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-purple-600">{referrer.appreciationTotal}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({referrer.appreciationApproved} Approved)</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-black text-[#1565C0] text-sm">{referrer.totalReferred}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleViewReferrals(referrer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-sky-100 rounded-lg text-[10px] font-bold text-[#1565C0] bg-sky-50/30 hover:bg-sky-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Breakdown
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
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl p-6 relative overflow-hidden animate-slideLeft">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[9px] font-bold text-[#1565C0] bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase tracking-wider block w-fit">
                  Referral Audit Breakdown
                </span>
                <h3 className="text-md font-bold text-slate-800 font-serif mt-2">
                  Referrer: {selectedReferrer.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Member ID: {selectedReferrer.membershipNo}
                </p>
              </div>
              <button 
                onClick={() => setSelectedReferrer(null)}
                className="p-1 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Sub-Tabs (Membership vs Appreciation) */}
            <div className="flex border-b my-3 bg-slate-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDetailTab("MEMBERSHIP")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  detailTab === "MEMBERSHIP" 
                    ? "bg-white text-indigo-700 shadow-sm border border-indigo-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Membership Referrals ({selectedReferrer.membershipTotal})
              </button>

              <button
                type="button"
                onClick={() => setDetailTab("APPRECIATION")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  detailTab === "APPRECIATION" 
                    ? "bg-white text-purple-700 shadow-sm border border-purple-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Ribbon className="w-3.5 h-3.5" />
                Appreciation Referrals ({selectedReferrer.appreciationTotal})
              </button>
            </div>

            {/* Modal Content List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3">
              {loadingDetails ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1565C0]" />
                </div>
              ) : detailTab === "MEMBERSHIP" ? (
                membershipDetails.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">No membership referrals recorded for this member.</p>
                ) : (
                  <div className="space-y-2.5">
                    {membershipDetails.map((member) => (
                      <div 
                        key={member.id} 
                        className="p-3.5 border border-indigo-100/70 rounded-xl bg-indigo-50/20 flex justify-between items-center text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            ID / ACK: {member.membershipNo || member.ackNo}
                          </p>
                          <span className="text-[9px] text-slate-400 block">
                            Joined: {new Date(member.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded border font-bold text-[9px] uppercase ${getStatusBadge(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                appreciationDetails.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">No appreciation certificate referrals recorded for this member.</p>
                ) : (
                  <div className="space-y-2.5">
                    {appreciationDetails.map((app) => (
                      <div 
                        key={app.id} 
                        className="p-3.5 border border-purple-100/70 rounded-xl bg-purple-50/20 flex justify-between items-center text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{app.name}</p>
                          <p className="text-[10px] text-purple-700 font-semibold">
                            Field: {app.socialWorkField}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Docket: {app.applicationNo}
                          </p>
                          <span className="text-[9px] text-slate-400 block">
                            Applied: {new Date(app.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded border font-bold text-[9px] uppercase ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Footer Summary */}
            <div className="border-t pt-4 flex justify-between text-xs text-slate-600 font-semibold bg-slate-50 -mx-6 -mb-6 p-4">
              <span>Combined Total: <strong className="text-slate-900">{selectedReferrer.totalReferred}</strong></span>
              <span className="text-emerald-700">Combined Approved: <strong>{selectedReferrer.totalApproved}</strong></span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
