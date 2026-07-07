"use client";

import React, { useState, useEffect } from "react";
import { getAppreciationApplications, getSignedDocumentUrl, updateAppreciationStatus } from "./actions";
import { FileCheck, XCircle, Search, Eye, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Award } from "lucide-react";

export default function AdminAppreciationPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAppreciationApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    setFilteredApplications(result);
  }, [filter, searchQuery, applications]);

  const handleOpenPrivateDoc = async (bucket: string, path: string) => {
    try {
      const res = await getSignedDocumentUrl(bucket, path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank");
      } else {
        showToast(res.error || "Failed to retrieve document link.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to retrieve document link.", "error");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to update application status.");
      showToast("Error updating status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-rose-50 text-rose-800 border-rose-100"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Appreciation Application Panel</h1>
            <p className="text-xs text-slate-400">Review and issue Certificates of Appreciation to outstanding contributors.</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or application number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#001C55]/10"
          />
        </div>

        {/* Filter select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">Filter Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/10"
          >
            <option value="ALL">All Applications</option>
            <option value="PENDING">Pending Payment</option>
            <option value="UNDER_REVIEW">Awaiting Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#001C55] animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading appreciation applications...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Award className="w-10 h-10 text-slate-200" />
            <span className="text-xs font-bold uppercase tracking-wider">No applications found</span>
            <span className="text-[10px] text-slate-400">Try modifying your filters or search query.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApplications.map((app) => {
              const isExpanded = expandedId === app.id;
              return (
                <div key={app.id} className="transition-colors hover:bg-slate-50/50">
                  {/* Summary row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Photo preview */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {app.photo_url ? (
                          <img src={app.photo_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Award className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {app.full_name}
                          <span className="text-[9px] font-bold text-slate-450 bg-slate-100 border px-1.5 py-0.5 rounded uppercase">
                            {app.application_no}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{app.email} &bull; {app.mobile}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status pill */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        app.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        app.status === "REJECTED" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                        app.status === "UNDER_REVIEW" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-slate-100 text-slate-600 border"
                      }`}>
                        {app.status === "UNDER_REVIEW" ? "Awaiting Review" : app.status}
                      </span>

                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                      {/* Left: Applicant details */}
                      <div className="space-y-4 pt-3">
                        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 mb-2">Application Information</h4>
                          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                            <div>
                              <span className="text-[9px] text-slate-450 block uppercase font-semibold">Social Work Field</span>
                              <strong className="text-slate-800">{app.social_work_field}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-450 block uppercase font-semibold">Country</span>
                              <strong className="text-slate-800">{app.country}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-450 block uppercase font-semibold">State / Province</span>
                              <strong className="text-slate-800">{app.state}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-450 block uppercase font-semibold">District / City</span>
                              <strong className="text-slate-800">{app.district}</strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[9px] text-slate-450 block uppercase font-semibold">Residential Address</span>
                              <strong className="text-slate-800">{app.address} &bull; {app.pincode}</strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[9px] text-slate-450 block uppercase font-semibold">Social Achievements Narrative</span>
                              <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 leading-normal text-[11px] mt-1 whitespace-pre-wrap">
                                {app.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Uploaded documents & actions */}
                      <div className="space-y-4 pt-3">
                        {/* Documents */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 mb-2">Uploaded Verification Files</h4>
                          
                          <div className="flex flex-col gap-2">
                            {/* Photo (Public url, open direct) */}
                            {app.photo_url && (
                              <a
                                href={app.photo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 border text-xs font-semibold text-slate-650"
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
                                className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 border text-xs font-semibold text-slate-650 w-full text-left"
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
                                className="flex items-center justify-between p-2 rounded bg-slate-50 hover:bg-slate-100 border text-xs font-semibold text-slate-650 w-full text-left"
                              >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-rose-600" /> Achievements Support Proof</span>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                            ) : (
                              <div className="p-2 text-slate-400 italic text-[11px]">No achievement proof document uploaded.</div>
                            )}
                          </div>
                        </div>

                        {/* Admin Action section */}
                        {(app.status === "UNDER_REVIEW" || app.status === "PENDING") && (
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                            <h4 className="text-[10px] font-bold text-[#001C55] uppercase tracking-wider border-b pb-1.5 mb-2">Review Action</h4>
                            {actionError && (
                              <div className="p-2 text-rose-800 bg-rose-50 border border-rose-100 text-[10px] rounded flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>{actionError}</span>
                              </div>
                            )}
                            <div className="space-y-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Board Decision Remarks (Optional / Req. for Rejections)</label>
                              <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={2}
                                className="w-full p-2 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#001C55]/10"
                                placeholder="Write decision notes or rejection reasons..."
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleStatusChange(app.id, "APPROVED")}
                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-550/10 cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                                Approve & Issue
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleStatusChange(app.id, "REJECTED")}
                                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shadow-rose-550/10 cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                Reject Application
                              </button>
                            </div>
                          </div>
                        )}

                        {app.status === "APPROVED" && (
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-medium leading-normal flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Application Approved:</strong> Appreciation Certificate has been successfully issued. The recipient has been notified via email with download instructions.
                              {app.remarks && <p className="text-[10px] text-emerald-700/80 mt-1 italic">&ldquo;{app.remarks}&rdquo;</p>}
                            </div>
                          </div>
                        )}

                        {app.status === "REJECTED" && (
                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-medium leading-normal flex items-start gap-2">
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
