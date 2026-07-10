"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getAppreciationApplications, getSignedDocumentUrl, updateAppreciationStatus } from "./actions";
import { FileCheck, XCircle, Search, Eye, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Award, Clock, Filter } from "lucide-react";

type AppreciationApplication = {
  id: string;
  application_no: string;
  full_name: string;
  email: string;
  mobile: string;
  address: string;
  country: string;
  state: string;
  district: string;
  pincode: string;
  social_work_field: string;
  description: string;
  photo_url?: string | null;
  id_proof_url?: string | null;
  achievement_proof_url?: string | null;
  status: string;
  remarks?: string | null;
};

export default function AdminAppreciationPage() {
  const [applications, setApplications] = useState<AppreciationApplication[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Administrative action states
  const [remarks, setRemarks] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({
    message: "",
    visible: false,
    type: "success"
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, visible: true, type });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getAppreciationApplications();
      setApplications(data as AppreciationApplication[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"];

  const statusCounts = useMemo(() => {
    return applications.reduce(
      (acc, application) => {
        acc.ALL += 1;
        acc[application.status] = (acc[application.status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let result = applications;
    if (filter !== "ALL") {
      result = result.filter((a) => a.status === filter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.application_no.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, searchQuery, applications]);

  const handleOpenPrivateDoc = async (bucket: string, path: string) => {
    try {
      const res = await getSignedDocumentUrl(bucket, path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank");
      } else {
        showToast(res.error || "Failed to retrieve document link.", "error");
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to retrieve document link.", "error");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateAppreciationStatus(id, newStatus, remarks);
      if (res.success) {
        setRemarks("");
        setExpandedId(null);
        await fetchData(); // Refresh list
        showToast(`Application successfully ${newStatus.toLowerCase()}!`, "success");
      } else {
        setActionError(res.error || "Failed to update application status.");
        showToast(res.error || "Failed to update status.", "error");
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update application status.");
      showToast("Error updating status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20";
    if (status === "REJECTED") return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20";
    if (status === "UNDER_REVIEW") return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20";
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === "success" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-100 dark:border-emerald-500/20" : "bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-100 dark:border-rose-500/20"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Award className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Appreciation Application Panel
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review and issue Certificates of Appreciation to outstanding contributors.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>{filteredApplications.length} visible of {applications.length} applications</span>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statusFilters.map((status) => {
          const isActive = filter === status;
          const label = status === "ALL" ? "All" : status.replace("_", " ");
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                {label}
              </span>
              <span className="block text-2xl font-black mt-2 tracking-tight">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or application number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
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
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === status
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {status === "ALL" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Data list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#001C55] animate-spin" />
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Loading appreciation applications...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
            <Award className="w-10 h-10 text-slate-200 dark:text-slate-700" />
            <span className="text-xs font-bold uppercase tracking-wider">No applications found</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Try modifying your filters or search query.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredApplications.map((app) => {
              const isExpanded = expandedId === app.id;
              return (
                <div key={app.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  {/* Summary row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className={`p-4 lg:px-5 lg:py-3 flex items-center justify-between gap-4 cursor-pointer ${
                      isExpanded ? "bg-blue-50/40 dark:bg-blue-500/5 border-b border-slate-100 dark:border-slate-800" : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1.2fr)_minmax(220px,1fr)_minmax(180px,0.8fr)] gap-4 flex-1 items-center">
                      <div className="flex items-center gap-3 min-w-0">
                      {/* Photo preview */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {app.photo_url ? (
                          <Image src={app.photo_url} width={40} height={40} className="h-full w-full object-cover" alt="" unoptimized />
                        ) : (
                          <Award className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{app.full_name}</span>
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded uppercase shrink-0">
                            {app.application_no}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{app.email} &bull; {app.mobile}</div>
                      </div>
                    </div>

                    <div className="min-w-0 text-xs">
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Field</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold block truncate">{app.social_work_field}</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5 truncate">{app.district}, {app.state}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status pill */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(app.status)}`}>
                        {app.status === "UNDER_REVIEW" ? "Awaiting Review" : app.status}
                      </span>
                    </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div className="px-4 lg:px-5 pb-5 pt-1 bg-slate-50/60 dark:bg-slate-950/50 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                      {/* Left: Applicant details */}
                      <div className="space-y-4 pt-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">Application Information</h4>
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Social Work Field</span>
                              <strong className="text-slate-800 dark:text-slate-100">{app.social_work_field}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Country</span>
                              <strong className="text-slate-800 dark:text-slate-100">{app.country}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">State / Province</span>
                              <strong className="text-slate-800 dark:text-slate-100">{app.state}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">District / City</span>
                              <strong className="text-slate-800 dark:text-slate-100">{app.district}</strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Residential Address</span>
                              <strong className="text-slate-800 dark:text-slate-100">{app.address} &bull; {app.pincode}</strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Social Achievements Narrative</span>
                              <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-800 leading-normal text-[11px] mt-1 whitespace-pre-wrap">
                                {app.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Uploaded documents & actions */}
                      <div className="space-y-4 pt-3">
                        {/* Documents */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">Uploaded Verification Files</h4>
                          
                          <div className="flex flex-col gap-2">
                            {/* Photo (Public url, open direct) */}
                            {app.photo_url && (
                              <a
                                href={app.photo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                              >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-sky-600" /> Applicant Passport Photo</span>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </a>
                            )}

                            {/* Identity proof (Private url, request signed url) */}
                            {app.id_proof_url && (
                              <button
                                type="button"
                                onClick={() => handleOpenPrivateDoc("aadhaar", app.id_proof_url)}
                                className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 w-full text-left"
                              >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" /> Government Identity Proof</span>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                            )}

                            {/* Achievement proof (Private url, request signed url) */}
                            {app.achievement_proof_url ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPrivateDoc("aadhaar", app.achievement_proof_url)}
                                className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 w-full text-left"
                              >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-rose-600" /> Achievements Support Proof</span>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                            ) : (
                              <div className="p-2 text-slate-400 dark:text-slate-500 italic text-[11px]">No achievement proof document uploaded.</div>
                            )}
                          </div>
                        </div>

                        {/* Admin Action section */}
                        {(app.status === "UNDER_REVIEW" || app.status === "PENDING") && (
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
                            <h4 className="text-[10px] font-bold text-[#001C55] dark:text-blue-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">Review Action</h4>
                            {actionError && (
                              <div className="p-2 text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-[10px] rounded flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>{actionError}</span>
                              </div>
                            )}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Board Decision Remarks (Optional / Req. for Rejections)</label>
                              <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={2}
                                className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#001C55]/10"
                                placeholder="Write decision notes or rejection reasons..."
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleStatusChange(app.id, "APPROVED")}
                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                                Approve & Issue
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleStatusChange(app.id, "REJECTED")}
                                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                Reject Application
                              </button>
                            </div>
                          </div>
                        )}

                        {app.status === "APPROVED" && (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-200 text-[11px] font-medium leading-normal flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Application Approved:</strong> Appreciation Certificate has been successfully issued. The recipient has been notified via email with download instructions.
                              {app.remarks && <p className="text-[10px] text-emerald-700/80 mt-1 italic">&ldquo;{app.remarks}&rdquo;</p>}
                            </div>
                          </div>
                        )}

                        {app.status === "REJECTED" && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-800 dark:text-rose-200 text-[11px] font-medium leading-normal flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Application Rejected:</strong> The review board rejected this application.
                              {app.remarks && <p className="text-[10px] text-rose-700/80 mt-1 italic">&ldquo;{app.remarks}&rdquo;</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
