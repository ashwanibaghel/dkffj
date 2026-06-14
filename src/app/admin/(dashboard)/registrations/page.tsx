"use client";

import React, { useState, useEffect } from "react";
import { getRegistrations, updateRegistrationStatus, issueCertificateForRegistration, getStudentProfile } from "./actions";
import { GraduationCap, Award, Search, Loader2, AlertCircle, Clock, Check, X, FileText, Download, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Administration action states
  const [remarks, setRemarks] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState({
    fatherName: "",
    durationFrom: "",
    durationTo: "",
    grade: "A",
    venue: "Online (DKFFJ Portal)",
    performance: "Excellent"
  });

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({
    message: "",
    visible: false,
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, visible: true, type });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
      setFilteredRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = registrations;
    if (filter !== "ALL") {
      result = result.filter((r) => r.status === filter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.full_name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (r.enrollment_no || "").toLowerCase().includes(q) ||
          (r.courses && r.courses.title && r.courses.title.toLowerCase().includes(q))
      );
    }
    setFilteredRegistrations(result);
  }, [filter, searchQuery, registrations]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateRegistrationStatus(id, newStatus, remarks);
      if (res.success) {
        setRemarks("");
        setExpandedId(null);
        await fetchData(); // Refresh
        showToast(`Enrollment registration ${newStatus.toLowerCase()} successfully!`, 'success');
      } else {
        setActionError(res.error || "Failed to update enrollment status.");
      }
    } catch (err) {
      setActionError("Error updating registration status.");
    } finally {
      setActionLoading(false);
    }
  };

  const startIssuance = async (reg: any) => {
    setIssuingId(reg.id);
    
    // Set default dates
    const regDate = new Date(reg.created_at);
    const fromDateStr = regDate.toISOString().split('T')[0]; // yyyy-mm-dd
    
    // Calculate end date based on course duration if available
    const endDate = new Date(reg.created_at);
    let months = 3;
    const durationStr = reg.courses?.duration || "3 Months";
    const match = durationStr.match(/(\d+)\s*(month|year)/i);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      if (unit.startsWith("year")) {
        months = val * 12;
      } else {
        months = val;
      }
    }
    endDate.setMonth(endDate.getMonth() + months);
    const toDateStr = endDate.toISOString().split('T')[0];
    
    setCertForm({
      fatherName: "Loading...",
      durationFrom: fromDateStr,
      durationTo: toDateStr,
      grade: "A",
      venue: "Online (DKFFJ Portal)",
      performance: "Excellent"
    });
    
    try {
      const profile = await getStudentProfile(reg.user_id);
      setCertForm(prev => ({
        ...prev,
        fatherName: profile?.father_name || ""
      }));
    } catch (err) {
      setCertForm(prev => ({
        ...prev,
        fatherName: ""
      }));
    }
  };

  const submitIssuance = async (id: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      // Format dates to DD/MM/YYYY for printing
      const formatDateStr = (dStr: string) => {
        if (!dStr) return "";
        const parts = dStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dStr;
      };

      const payload = {
        fatherName: certForm.fatherName,
        durationFrom: formatDateStr(certForm.durationFrom),
        durationTo: formatDateStr(certForm.durationTo),
        grade: certForm.grade,
        venue: certForm.venue,
        performance: certForm.performance
      };

      const res = await issueCertificateForRegistration(id, payload);
      if (res.success) {
        setIssuingId(null);
        setExpandedId(null);
        await fetchData(); // Refresh
        showToast(`Certificate issued successfully! Serial: ${res.certNo}`, 'success');
      } else {
        setActionError(res.error || "Failed to issue certificate.");
      }
    } catch (err) {
      setActionError("Error executing certificate generation.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "APPROVED") return "bg-sky-50 text-sky-700 border-sky-200";
    if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#0F4C81]" /> Academy Enrollments Review
        </h1>
        <p className="text-slate-500 text-xs mt-1">Review student registrations, check payment ledger status, and issue graduation certificates.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "APPROVED", "COMPLETED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === f
                  ? "bg-[#0F4C81] text-white border-[#0F4C81]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f === "ALL" ? "All Registrations" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by student, course, enrollment..."
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
          <p className="text-xs text-slate-500">Loading registrations list...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">No matching registrations found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
          {filteredRegistrations.map((reg) => {
            const isExpanded = expandedId === reg.id;
            return (
              <div key={reg.id} className="transition-all">
                
                {/* Header view */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                  className={`p-4 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-50/50 transition-colors ${
                    isExpanded ? "bg-slate-50/50 border-b border-slate-100" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{reg.full_name}</h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">Ref No: {reg.enrollment_no}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Course Applied</span>
                      <span className="text-slate-800 font-bold mt-0.5 block">{reg.courses?.title || "Unknown Course"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Contact Info</span>
                      <span className="text-slate-650 block mt-0.5">{reg.email}</span>
                      <span className="text-slate-650 block mt-0.5">{reg.mobile}</span>
                    </div>
                    <div className="self-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(reg.status)}`}>
                        {reg.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 ml-4">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Review panel */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/20 border-b border-slate-100 space-y-4">
                    {actionError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    <div className="p-4 bg-white border rounded-xl grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Student Profile</span>
                        <span className="text-slate-850 mt-1 block">{reg.full_name}</span>
                        <span className="text-slate-500 mt-0.5 block">{reg.email} | {reg.mobile}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Registration Date</span>
                        <span className="text-slate-850 mt-1 block">{new Date(reg.created_at).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Action Desk */}
                    {reg.status === "PENDING" && (
                      <div className="space-y-3 bg-white p-4 rounded-xl border">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enrollment Application Review</span>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Provide review remarks (optional)..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(reg.id, "REJECTED")}
                            disabled={actionLoading}
                            className="px-4 py-2 border border-rose-250 hover:bg-rose-50 text-xs font-bold text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            Reject Enrollment
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(reg.id, "APPROVED")}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Approve & Enroll
                          </button>
                        </div>
                      </div>
                    )}

                    {reg.status === "APPROVED" && issuingId !== reg.id && (
                      <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">Course Completed?</span>
                          <span className="text-slate-500 mt-0.5 block">You can now generate the graduation certificate and dispatch it to the student's email.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startIssuance(reg)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#0F4C81] text-white hover:bg-[#0c3c66] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <Award className="w-4 h-4" /> Issue Graduation Certificate
                        </button>
                      </div>
                    )}

                    {reg.status === "APPROVED" && issuingId === reg.id && (
                      <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
                        <div className="flex items-center gap-2 border-b pb-3 mb-3">
                          <Award className="w-5 h-5 text-[#0F4C81]" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Configure Certificate Credentials</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div>
                            <label className="block text-slate-500 mb-1">Father's Name</label>
                            <input
                              type="text"
                              value={certForm.fatherName}
                              onChange={(e) => setCertForm({ ...certForm, fatherName: e.target.value })}
                              placeholder="Student's Father Name"
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F4C81]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Grade / Percentage</label>
                            <input
                              type="text"
                              value={certForm.grade}
                              onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                              placeholder="e.g. A+, A, Outstanding"
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F4C81]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Duration From</label>
                            <input
                              type="date"
                              value={certForm.durationFrom}
                              onChange={(e) => setCertForm({ ...certForm, durationFrom: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F4C81]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Duration To</label>
                            <input
                              type="date"
                              value={certForm.durationTo}
                              onChange={(e) => setCertForm({ ...certForm, durationTo: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F4C81]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Training Venue</label>
                            <input
                              type="text"
                              value={certForm.venue}
                              onChange={(e) => setCertForm({ ...certForm, venue: e.target.value })}
                              placeholder="e.g. Online (DKFFJ Portal)"
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F4C81]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">Performance/Conduct Rating</label>
                            <input
                              type="text"
                              value={certForm.performance}
                              onChange={(e) => setCertForm({ ...certForm, performance: e.target.value })}
                              placeholder="e.g. Excellent, Very Good"
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0F4C81]"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4 mt-4">
                          <button
                            type="button"
                            onClick={() => setIssuingId(null)}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-650 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => submitIssuance(reg.id)}
                            disabled={actionLoading}
                            className="px-5 py-2.5 bg-[#0F4C81] text-white hover:bg-[#0c3c66] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <Award className="w-4 h-4" /> Generate & Dispatch Certificate
                          </button>
                        </div>
                      </div>
                    )}

                    {reg.status === "COMPLETED" && (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          Course completed. Certificate has been generated and dispatched.
                        </div>
                      </div>
                    )}

                    {reg.remarks && (
                      <div className="p-3 bg-slate-100/50 border rounded-lg text-xs text-slate-500 font-semibold italic">
                        &ldquo;Board Notes: {reg.remarks}&rdquo;
                      </div>
                    )}

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
