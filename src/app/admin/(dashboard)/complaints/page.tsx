"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getComplaints, updateComplaintStatus } from "./actions";
import { getSignedDocumentUrl } from "../members/actions";
import { ShieldAlert, Search, Loader2, AlertCircle, Eye, ChevronDown, ChevronUp, Clock, Gavel, CheckCircle, FileText } from "lucide-react";

type ComplaintAttachment = {
  id: string;
  file_url: string;
  file_name: string;
  file_size?: string | null;
};

type ComplaintRecord = {
  id: string;
  complaint_no: string;
  name: string;
  father_name: string;
  gender: string;
  mobile: string;
  email?: string | null;
  address: string;
  state: string;
  district: string;
  police_station: string;
  details: string;
  status: string;
  created_at: string;
  complaint_attachments?: ComplaintAttachment[];
};

const parseDetails = (detailsStr: string) => {
  try {
    const parsed = JSON.parse(detailsStr);
    if (parsed && typeof parsed === "object" && "complaint_text" in parsed) {
      return parsed;
    }
  } catch (e) {}
  return null;
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status updates
  const [remarks, setRemarks] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("UNDER_INVESTIGATION");
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

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getComplaints();
      setComplaints(data as ComplaintRecord[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "SUBMITTED", "UNDER_INVESTIGATION", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  const statusCounts = useMemo(() => {
    return complaints.reduce(
      (acc, complaint) => {
        acc.ALL += 1;
        acc[complaint.status] = (acc[complaint.status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    let result = complaints;
    if (filter !== "ALL") {
      result = result.filter((c) => c.status === filter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.complaint_no.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }
    return result;
  }, [filter, searchQuery, complaints]);

  const handleOpenPrivateDoc = async (path: string) => {
    try {
      // Complaints files are saved in "complaints" bucket
      const res = await getSignedDocumentUrl("complaints", path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank");
      } else {
        showToast(res.error || "Failed to generate file access token.", "error");
      }
    } catch {
      showToast("Error fetching document link.", "error");
    }
  };

  const handleAction = async (id: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateComplaintStatus(id, newStatus, remarks);
      if (res.success) {
        setRemarks("");
        setExpandedId(null);
        await fetchData(); // Refresh
        showToast("Grievance case status updated successfully!", "success");
      } else {
        setActionError(res.error || "Failed to update complaint status.");
        showToast(res.error || "Failed to update complaint status.", "error");
      }
    } catch {
      setActionError("Error updating case record.");
      showToast("Error updating case record.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === "RESOLVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "SUBMITTED") return "bg-amber-50 text-amber-700 border-amber-200";
    if (["UNDER_INVESTIGATION", "IN_PROGRESS"].includes(s)) return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Grievance Investigation Cell
        </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review public violations, access uploaded evidences, and log investigation findings.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>{filteredComplaints.length} visible of {complaints.length} cases</span>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statusFilters.map((status) => {
          const isActive = filter === status;
          const label = status === "ALL" ? "All" : status.replaceAll("_", " ");
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#C00000] text-white border-[#C00000] shadow-lg shadow-red-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${isActive ? "text-red-100" : "text-slate-400 dark:text-slate-500"}`}>
                {label}
              </span>
              <span className="block text-2xl font-black mt-2 tracking-tight">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === f
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {f === "ALL" ? "All Grievances" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search docket, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-rose-500/10 font-semibold"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading cases registry, please wait...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">No active grievances match the selected criteria.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="hidden lg:grid grid-cols-[minmax(220px,1.2fr)_minmax(190px,0.9fr)_minmax(230px,1.1fr)_minmax(150px,0.7fr)_90px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sticky top-0 z-10">
            <span>Docket</span>
            <span>Contact</span>
            <span>Location</span>
            <span>Status</span>
            <span className="text-right">Evidence</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredComplaints.map((complaint) => {
            const isExpanded = expandedId === complaint.id;
            const attachmentCount = complaint.complaint_attachments?.length || 0;
            return (
              <div key={complaint.id} className="transition-all">
                
                {/* Collapsed view header */}
                <div
                  onClick={() => {
                    setExpandedId(isExpanded ? null : complaint.id);
                    if (!isExpanded) {
                      setNewStatus(complaint.status);
                    }
                  }}
                  className={`p-4 lg:px-5 lg:py-3 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isExpanded ? "bg-rose-50/40 dark:bg-rose-500/5 border-b border-slate-100 dark:border-slate-800" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.2fr)_minmax(190px,0.9fr)_minmax(230px,1.1fr)_minmax(150px,0.7fr)_90px] gap-4 flex-1 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center shrink-0">
                        <Gavel className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate">Docket: {complaint.complaint_no}</h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">By: {complaint.name}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Contact</span>
                      <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{complaint.mobile}</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5 truncate">{complaint.email || "No Email"}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Occurrence Location</span>
                      <span className="text-slate-700 dark:text-slate-300 block mt-0.5 truncate">{complaint.district}, {complaint.state}</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5 truncate">Thana: {complaint.police_station}</span>
                    </div>
                    <div className="self-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-start lg:justify-end gap-2 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] font-black">
                        <FileText className="w-3.5 h-3.5" />
                        {attachmentCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 ml-4">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded details panel */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/20 border-b border-slate-100 space-y-6">
                    {actionError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    {(() => {
                      const parsed = parseDetails(complaint.details);
                      if (parsed) {
                        return (
                          <>
                            {/* Premium Header Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex flex-col gap-1 shadow-sm">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Incident Category / Grievance</span>
                                <span className="text-sm font-extrabold text-[#C00000]">{parsed.incident_category}</span>
                              </div>
                              <div className="p-4 bg-sky-50/50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 rounded-2xl flex flex-col gap-1 shadow-sm">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Occurrence Incident Date</span>
                                <span className="text-sm font-extrabold text-[#001C55] dark:text-sky-350">{parsed.incident_date}</span>
                              </div>
                            </div>

                            {/* Description narrative */}
                            <div className="space-y-2">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Grievance Narrative / Statement</span>
                              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl text-xs leading-relaxed text-slate-700 whitespace-pre-line shadow-sm">
                                {parsed.complaint_text}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Personal Details */}
                              <div className="space-y-2 text-xs font-semibold text-slate-700">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Grievant Profile</span>
                                <table className="w-full">
                                  <tbody>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Full Name:</td>
                                      <td className="text-slate-800">{complaint.name} ({complaint.gender})</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Father&apos;s Name:</td>
                                      <td className="text-slate-800">{complaint.father_name}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Date Of Birth:</td>
                                      <td className="text-slate-800">{parsed.dob}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Profession:</td>
                                      <td className="text-slate-800">{parsed.profession}</td>
                                    </tr>
                                    <tr className="py-1.5 flex justify-between">
                                      <td className="text-slate-400">WhatsApp:</td>
                                      <td className="text-slate-800">{parsed.whatsapp_no}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Incident Place Details */}
                              <div className="space-y-2 text-xs font-semibold text-slate-700">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Occurrence Address</span>
                                <table className="w-full">
                                  <tbody>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Landmark/Street:</td>
                                      <td className="text-slate-800">{parsed.landmark}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Post Office:</td>
                                      <td className="text-slate-800">{parsed.post_office}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Tehsil:</td>
                                      <td className="text-slate-800">{parsed.tehsil}</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                      <td className="text-slate-400">Police Station:</td>
                                      <td className="text-slate-800">{complaint.police_station}</td>
                                    </tr>
                                    <tr className="py-1.5 flex justify-between">
                                      <td className="text-slate-400">City/District:</td>
                                      <td className="text-slate-800">{complaint.district}, {complaint.state} ({parsed.pincode})</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        );
                      }

                      return (
                        <>
                          {/* Fallback Legacy Mode */}
                          <div className="space-y-2">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Grievance Narrative / Statement</span>
                            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl text-xs leading-relaxed text-slate-700 whitespace-pre-line shadow-sm">
                              {complaint.details}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-2 text-xs font-semibold text-slate-700">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Case References</span>
                              <table className="w-full">
                                <tbody>
                                  <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                    <td className="text-slate-400">Grievant Name:</td>
                                    <td className="text-slate-800">{complaint.name} ({complaint.gender})</td>
                                  </tr>
                                  <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                    <td className="text-slate-400">Father&apos;s Name:</td>
                                    <td className="text-slate-800">{complaint.father_name}</td>
                                  </tr>
                                  <tr className="border-b border-slate-100 py-1.5 flex justify-between">
                                    <td className="text-slate-400">Incident Place:</td>
                                    <td className="text-slate-800 text-right">{complaint.address}</td>
                                  </tr>
                                  <tr className="py-1.5 flex justify-between">
                                    <td className="text-slate-400">Date Logged:</td>
                                    <td className="text-slate-800">{new Date(complaint.created_at).toLocaleString("en-IN")}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                      {/* Attachments list */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Evidence Files Attached</span>
                        {(!complaint.complaint_attachments || complaint.complaint_attachments.length === 0) ? (
                          <p className="text-xs text-slate-450 italic p-3 bg-white border border-slate-100 rounded-lg">No evidence files uploaded by grievant.</p>
                        ) : (
                          <div className="space-y-2">
                            {complaint.complaint_attachments.map((file: ComplaintAttachment) => (
                              <div key={file.id} className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs shadow-sm">
                                <span className="font-semibold text-slate-700 truncate max-w-[70%]">{file.file_name} <span className="text-[9px] text-slate-400 font-normal">({file.file_size})</span></span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPrivateDoc(file.file_url)}
                                  className="px-2.5 py-1 border rounded hover:bg-slate-50 text-[10px] font-bold text-[#001C55] flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View File
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    {/* Action Panel */}
                    <div className="border-t border-slate-200 pt-5 space-y-4 bg-white p-4 rounded-xl border">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Case Action Panel</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Set Status</label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none"
                          >
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED (Case Complete)</option>
                            <option value="CLOSED">CLOSED (Dismissed/Withdrawn)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Action logs / Remarks</label>
                          <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="State current progress or resolution terms..."
                            rows={1.5}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t mt-3">
                        <button
                          type="button"
                          onClick={() => handleAction(complaint.id)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#C00000] text-white hover:bg-[#990000] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          Update Case File
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all duration-300 ease-out ${
          toast.visible
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        } ${
          toast.type === "success"
            ? "bg-emerald-600 text-white border-emerald-500"
            : "bg-rose-600 text-white border-rose-500"
        }`}
      >
        {toast.type === "success" ? (
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-100" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-100" />
        )}
        <span>{toast.message}</span>
      </div>

    </div>
  );
}
