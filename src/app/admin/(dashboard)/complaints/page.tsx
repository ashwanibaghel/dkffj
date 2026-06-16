"use client";

import React, { useState, useEffect } from "react";
import { getComplaints, updateComplaintStatus } from "./actions";
import { getSignedDocumentUrl } from "../members/actions";
import { ShieldAlert, Search, Loader2, AlertCircle, Eye, ChevronDown, ChevronUp, Clock, Gavel, CheckCircle } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filteredComplaints, setFilteredMembers] = useState<any[]>([]);
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
      const data = await getComplaints();
      setComplaints(data);
      setFilteredMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    setFilteredMembers(result);
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
    } catch (err) {
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
    } catch (err) {
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
      <div>
        <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Grievance Investigation Cell
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review public violations, access uploaded evidences, and log investigation findings.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "SUBMITTED", "UNDER_INVESTIGATION", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === f
                  ? "bg-[#0F4C81] text-white border-[#0F4C81]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f === "ALL" ? "All Grievances" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by name, Docket No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81] mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading cases registry, please wait...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">No active grievances match the selected criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
          {filteredComplaints.map((complaint) => {
            const isExpanded = expandedId === complaint.id;
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
                  className={`p-4 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-50/50 transition-colors ${
                    isExpanded ? "bg-slate-50/50 border-b border-slate-100" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Docket: {complaint.complaint_no}</h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">By: {complaint.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Contact</span>
                      <span className="text-slate-650 block mt-0.5">{complaint.mobile}</span>
                      <span className="text-slate-650 block mt-0.5">{complaint.email || "No Email"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Occurrence Location</span>
                      <span className="text-slate-650 block mt-0.5 truncate">{complaint.district}, {complaint.state}</span>
                      <span className="text-slate-650 block mt-0.5 truncate">Thana: {complaint.police_station}</span>
                    </div>
                    <div className="self-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
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

                    {/* Description narrative */}
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
                              <td className="text-slate-400">Father's Name:</td>
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

                      {/* Attachments list */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Evidence Files Attached</span>
                        {(!complaint.complaint_attachments || complaint.complaint_attachments.length === 0) ? (
                          <p className="text-xs text-slate-450 italic p-3 bg-white border border-slate-100 rounded-lg">No evidence files uploaded by grievant.</p>
                        ) : (
                          <div className="space-y-2">
                            {complaint.complaint_attachments.map((file: any) => (
                              <div key={file.id} className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between text-xs shadow-sm">
                                <span className="font-semibold text-slate-700 truncate max-w-[70%]">{file.file_name} <span className="text-[9px] text-slate-400 font-normal">({file.file_size})</span></span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPrivateDoc(file.file_url)}
                                  className="px-2.5 py-1 border rounded hover:bg-slate-50 text-[10px] font-bold text-[#0F4C81] flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View File
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                            className="w-full px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t mt-3">
                        <button
                          type="button"
                          onClick={() => handleAction(complaint.id)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#D62828] text-white hover:bg-[#b02020] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
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
