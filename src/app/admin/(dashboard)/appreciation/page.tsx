"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getAppreciationApplications, getSignedDocumentUrl, updateAppreciationStatus } from "./actions";
import { 
  FileCheck, 
  XCircle, 
  Search, 
  Eye, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Award, 
  Clock, 
  Filter,
  Download,
  X
} from "lucide-react";
import AdminEmptyState from "../components/AdminEmptyState";
import { AppreciationCertificateRenderer, generateAppreciationPDFClient } from "./AppreciationCertificateGenerator";

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

function cleanAppNo(no?: string) {
  if (!no) return "";
  return no
    .replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/")
    .replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/")
    .replace(/(\d{4})\/-\1-/g, "$1/");
}

export default function AdminAppreciationPage() {
  const [applications, setApplications] = useState<AppreciationApplication[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Certificate Modal State
  const [selectedCertApp, setSelectedCertApp] = useState<AppreciationApplication | null>(null);
  const [downloadingCert, setDownloadingCert] = useState<boolean>(false);

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
          a.application_no.toLowerCase().includes(q) ||
          cleanAppNo(a.application_no).toLowerCase().includes(q)
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

  const handleStatusChange = async (applicationId: string, newStatus: "APPROVED" | "REJECTED") => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateAppreciationStatus(applicationId, newStatus, remarks);
      if (res.success) {
        showToast(`Application status updated to ${newStatus}!`, "success");
        setRemarks("");
        await fetchData();
      } else {
        setActionError(res.error || "Failed to update status.");
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error updating status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadCertificateModal = async (app: AppreciationApplication) => {
    setDownloadingCert(true);
    try {
      const appUrl = typeof window !== "undefined" ? window.location.origin : "https://dkffj.vercel.app";
      const refNo = cleanAppNo(app.application_no);
      const verificationUrl = `${appUrl}/track?type=appreciation&id=${refNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      const issueDateStr = new Date().toLocaleDateString("en-IN");

      const pdfBlob = await generateAppreciationPDFClient({
        applicationNo: refNo,
        fullName: app.full_name,
        socialWorkField: app.social_work_field,
        issueDateStr,
        qrCodeUrl,
        verificationUrl,
        photoUrl: app.photo_url || null
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Appreciation_Certificate_${refNo.replace(/\//g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("Appreciation certificate downloaded successfully!", "success");
    } catch (err: any) {
      console.error("Certificate download error:", err);
      showToast(`Error generating certificate: ${err.message || err}`, "error");
    } finally {
      setDownloadingCert(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      case "UNDER_REVIEW":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 transition-all ${
          toast.type === "success" 
            ? "bg-emerald-600 text-white border-emerald-500" 
            : "bg-rose-600 text-white border-rose-500"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Award className="w-6 h-6 text-[#001C55] dark:text-blue-400" /> Appreciation Applications & Certificates
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review submitted social work appreciation certificate applications, generate certificates, and issue board approvals.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusFilters.map((tab) => {
            const count = statusCounts[tab] || 0;
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#001C55] text-white shadow-md shadow-blue-950/20 dark:bg-blue-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab === "UNDER_REVIEW" ? "Awaiting Review" : tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, app no..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#001C55]/20 dark:focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#001C55] dark:text-blue-400" />
            <span className="text-xs font-bold tracking-wide">Loading Appreciation Applications...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              icon={Award}
              title="No Applications Found"
              description="There are currently no appreciation certificate applications matching your search or filter."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredApplications.map((app) => {
              const isExpanded = expandedId === app.id;
              const cleanedNo = cleanAppNo(app.application_no);
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
                          <img
                            src={app.photo_url}
                            className="h-full w-full object-cover"
                            alt=""
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).onerror = null;
                              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.full_name || "Applicant")}&background=001C55&color=fff`;
                            }}
                          />
                        ) : (
                          <Award className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{app.full_name}</span>
                          <span className="text-[9.5px] font-mono font-bold text-[#001C55] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.5 rounded shrink-0">
                            {cleanedNo}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCertApp(app);
                        }}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                        title="View Certificate"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="hidden sm:inline">View Certificate</span>
                      </button>

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
                        {/* Certificate Action Card */}
                        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                              <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                                Certificate Generator
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded">
                              {cleanedNo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Generate and preview the official high-resolution Certificate of Appreciation for {app.full_name}.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedCertApp(app)}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                            >
                              <Award className="w-4 h-4" />
                              <span>View Certificate</span>
                            </button>

                            <button
                              type="button"
                              disabled={downloadingCert}
                              onClick={() => handleDownloadCertificateModal(app)}
                              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                            >
                              {downloadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              <span>Download PDF</span>
                            </button>
                          </div>
                        </div>

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
                                onClick={() => handleOpenPrivateDoc("aadhaar", app.id_proof_url!)}
                                className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 w-full text-left cursor-pointer"
                              >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" /> Government Identity Proof</span>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                            )}

                            {/* Achievement proof (Private url, request signed url) */}
                            {app.achievement_proof_url && (
                              <button
                                type="button"
                                onClick={() => handleOpenPrivateDoc("aadhaar", app.achievement_proof_url!)}
                                className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 w-full text-left cursor-pointer"
                              >
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-600" /> Achievement Supporting Proof</span>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Status update actions */}
                        {app.status !== "APPROVED" && app.status !== "REJECTED" && (
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">Board Verification Actions</h4>
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

      {/* Interactive Certificate Preview Modal */}
      {selectedCertApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Certificate of Appreciation Preview
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedCertApp.full_name} &bull; <span className="font-mono font-bold text-[#001C55] dark:text-blue-400">{cleanAppNo(selectedCertApp.application_no)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={downloadingCert}
                  onClick={() => handleDownloadCertificateModal(selectedCertApp)}
                  className="px-4 py-2 bg-gradient-to-r from-[#001C55] to-[#C00000] text-white hover:opacity-95 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {downloadingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCertApp(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Certificate Live Renderer */}
            <div className="p-4 sm:p-8 overflow-y-auto flex items-center justify-center bg-slate-900/10 dark:bg-slate-950">
              <div className="transform scale-[0.6] sm:scale-[0.78] md:scale-[0.88] lg:scale-[0.95] origin-top shadow-2xl rounded-lg overflow-hidden border border-amber-900/20 my-2">
                <AppreciationCertificateRenderer
                  data={{
                    applicationNo: cleanAppNo(selectedCertApp.application_no),
                    fullName: selectedCertApp.full_name,
                    socialWorkField: selectedCertApp.social_work_field,
                    issueDateStr: new Date().toLocaleDateString("en-IN"),
                    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `${typeof window !== "undefined" ? window.location.origin : "https://dkffj.vercel.app"}/track?type=appreciation&id=${cleanAppNo(selectedCertApp.application_no)}`
                    )}`,
                    verificationUrl: `${typeof window !== "undefined" ? window.location.origin : "https://dkffj.vercel.app"}/track?type=appreciation&id=${cleanAppNo(selectedCertApp.application_no)}`,
                    photoUrl: selectedCertApp.photo_url || null
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
