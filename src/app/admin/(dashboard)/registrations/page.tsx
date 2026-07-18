"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getRegistrations, updateRegistrationStatus, issueCertificateForRegistration, getStudentProfile, updateCertificatePdfUrl, sendCertificateFilesEmail } from "./actions";
import { generateCertificatePDFClient } from "./CertificateGenerator";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, Award, Search, Loader2, AlertCircle, Clock, Download, CheckCircle, ChevronUp, ChevronDown, BookOpen } from "lucide-react";

type CourseInfo = {
  title?: string | null;
  duration?: string | null;
};

type CertificateInfo = {
  certificate_no: string;
  issue_date: string;
  grade?: string | null;
  performance?: string | null;
  venue?: string | null;
  pdf_url?: string | null;
};

type RegistrationRecord = {
  id: string;
  user_id: string;
  enrollment_no?: string | null;
  full_name: string;
  mobile: string;
  email: string;
  father_name?: string | null;
  photo_url?: string | null;
  working_sector?: string | null;
  experience_cert_url?: string | null;
  training_center?: string | null;
  qualification?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  state?: string | null;
  district?: string | null;
  qualification_doc_url?: string | null;
  aadhaar_doc_url?: string | null;
  status: string;
  remarks?: string | null;
  created_at: string;
  courses?: CourseInfo | null;
  certificates?: CertificateInfo[];
};

type CertFormState = {
  fatherName: string;
  durationFrom: string;
  durationTo: string;
  grade: string;
  venue: string;
  performance: string;
};

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Administration action states
  const [remarks, setRemarks] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<CertFormState>({
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

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data as RegistrationRecord[]);
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "PENDING", "APPROVED", "COMPLETED", "REJECTED"];

  const statusCounts = useMemo(() => {
    return registrations.reduce(
      (acc, registration) => {
        acc.ALL += 1;
        acc[registration.status] = (acc[registration.status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
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
    return result;
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
    } catch {
      setActionError("Error updating registration status.");
    } finally {
      setActionLoading(false);
    }
  };

  const startIssuance = async (reg: RegistrationRecord) => {
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
      fatherName: reg.father_name || "Loading...",
      durationFrom: fromDateStr,
      durationTo: toDateStr,
      grade: "A",
      venue: reg.training_center || "Online (DKFFJ Portal)",
      performance: "Excellent"
    });
    
    if (!reg.father_name) {
      try {
        const profile = await getStudentProfile(reg.user_id);
        setCertForm(prev => ({
          ...prev,
          fatherName: profile?.father_name || ""
        }));
      } catch {
        setCertForm(prev => ({
          ...prev,
          fatherName: ""
        }));
      }
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
        // Generate PDF client-side
        try {
          const supabase = createClient();
          const pdfPath = `certs/cert_${res.certNo}.pdf`;
          const pngPath = `certs/cert_${res.certNo}.png`;

          const { pdfBlob, pngBlob } = await generateCertificatePDFClient({
            certNo: res.certNo!,
            qrCodeUrl: res.qrCodeUrl!,
            verificationUrl: res.verificationUrl!,
            studentName: res.studentName!,
            courseTitle: res.courseTitle!,
            photoUrl: res.photoUrl,
            fatherName: res.fatherName!,
            enrollmentNo: res.enrollmentNo!,
            durationFrom: res.durationFrom!,
            durationTo: res.durationTo!,
            grade: res.grade!,
            venue: res.venue!,
            performance: res.performance!,
            dateStr: res.dateStr!
          });

          // Upload PDF
          const { error: uploadError } = await supabase.storage
            .from("certificates")
            .upload(pdfPath, pdfBlob, { contentType: "application/pdf", upsert: true });

          if (uploadError) {
            throw new Error(`Failed to upload certificate PDF: ${uploadError.message}`);
          }

          // Upload PNG
          const { error: pngUploadError } = await supabase.storage
            .from("certificates")
            .upload(pngPath, pngBlob, { contentType: "image/png", upsert: true });

          if (pngUploadError) {
            throw new Error(`Failed to upload certificate PNG: ${pngUploadError.message}`);
          }

          const { data: publicUrlRes } = supabase.storage.from("certificates").getPublicUrl(pdfPath);
          const pdfUrl = publicUrlRes.publicUrl;

          const updateRes = await updateCertificatePdfUrl(res.certNo!, pdfUrl);
          if (!updateRes.success) {
            throw new Error(updateRes.error || "Failed to update PDF URL in database");
          }

          // Dispatch transactional email with PDF & PNG attachments
          const emailRes = await sendCertificateFilesEmail(res.certNo!);
          if (!emailRes.success) {
            throw new Error(emailRes.error || "Failed to send email with certificate attachments");
          }
        } catch (pdfErr: any) {
          console.error("Client side PDF/PNG generation/upload/email error:", pdfErr);
          showToast(`Certificate created but files/email dispatch failed: ${pdfErr.message || pdfErr}`, "error");
        }

        setIssuingId(null);
        setExpandedId(null);
        await fetchData(); // Refresh
        showToast(`Certificate issued successfully! Serial: ${res.certNo}`, 'success');
      } else {
        setActionError(res.error || "Failed to issue certificate.");
      }
    } catch {
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
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <GraduationCap className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Academy Enrollments Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review student registrations, check payment ledger status, and issue graduation certificates.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>{filteredRegistrations.length} visible of {registrations.length} enrollments</span>
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
              {f === "ALL" ? "All Registrations" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search student, course, enrollment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading registrations list...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">No matching registrations found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="hidden lg:grid grid-cols-[minmax(250px,1.25fr)_minmax(230px,1fr)_minmax(210px,0.95fr)_minmax(150px,0.7fr)_90px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sticky top-0 z-10">
            <span>Student</span>
            <span>Course</span>
            <span>Contact</span>
            <span>Status</span>
            <span className="text-right">Credential</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRegistrations.map((reg) => {
            const isExpanded = expandedId === reg.id;
            const cert = reg.certificates?.[0];
            return (
              <div key={reg.id} className="transition-all">
                
                {/* Header view */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                  className={`p-4 lg:px-5 lg:py-3 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isExpanded ? "bg-blue-50/40 dark:bg-blue-500/5 border-b border-slate-100 dark:border-slate-800" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(250px,1.25fr)_minmax(230px,1fr)_minmax(210px,0.95fr)_minmax(150px,0.7fr)_90px] gap-4 flex-1 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      {reg.photo_url ? (
                        <Image
                          src={reg.photo_url}
                          alt={reg.full_name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                          {reg.full_name ? reg.full_name.charAt(0) : "S"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate">{reg.full_name}</h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block font-mono">Ref No: {reg.enrollment_no || "PENDING"}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Course Applied</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block truncate">{reg.courses?.title || "Unknown Course"}</span>
                      <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">{reg.courses?.duration || "Duration not set"}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Contact Info</span>
                      <span className="text-slate-700 dark:text-slate-300 block mt-0.5 truncate">{reg.email}</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5">{reg.mobile}</span>
                    </div>
                    <div className="self-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(reg.status)}`}>
                        {reg.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-start lg:justify-end gap-2 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] font-black">
                        <BookOpen className="w-3.5 h-3.5" />
                        {cert?.certificate_no ? "Issued" : "Open"}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 ml-4">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Review panel */}
                {isExpanded && (
                  <div className="p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 space-y-4">
                    {actionError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-[11px] text-rose-800 dark:text-rose-200 font-semibold rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                      {/* Column 1: Student Profile & Basic Info */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-black uppercase tracking-[0.14em]">Student Profile</span>
                        <span className="text-slate-950 dark:text-slate-100 text-sm font-extrabold block">{reg.full_name}</span>
                        <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">{reg.email}</span>
                        <span className="text-slate-500 dark:text-slate-400 block font-mono text-[11px]">{reg.mobile}</span>
                        {reg.father_name && <span className="text-slate-600 dark:text-slate-350 block mt-1">Father: <span className="font-bold">{reg.father_name}</span></span>}
                        <span className="text-slate-600 dark:text-slate-350 block">Gender: <span className="font-bold text-slate-800 dark:text-slate-200">{reg.gender || "Not Specified"}</span></span>
                        <span className="text-slate-600 dark:text-slate-350 block">DOB: <span className="font-bold text-slate-800 dark:text-slate-200">{reg.dob ? new Date(reg.dob).toLocaleDateString("en-IN") : "Not Specified"}</span></span>
                      </div>

                      {/* Column 2: Address & Regional details */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-black uppercase tracking-[0.14em]">Address Details</span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[11px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60 font-medium">
                          {reg.address || "No address recorded."}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">District</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200 block truncate">{reg.district || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">State</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200 block truncate">{reg.state || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Academic, Center & Document Attachments */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-black uppercase tracking-[0.14em]">Academic & Attachments</span>
                        <div className="text-[11px] space-y-1 bg-[#001C55]/[0.02] dark:bg-blue-500/[0.02] p-2.5 rounded-lg border border-blue-500/10">
                          <span className="text-slate-800 dark:text-slate-200 block">Sector: <span className="font-black text-[#001C55] dark:text-blue-400">{reg.working_sector || "Not Specified"}</span></span>
                          <span className="text-slate-800 dark:text-slate-200 block">Center: <span className="font-black text-[#001C55] dark:text-blue-400">{reg.training_center || "Not Assigned"}</span></span>
                          <span className="text-slate-800 dark:text-slate-200 block">Qual: <span className="font-black text-slate-900 dark:text-slate-100">{reg.qualification || "Not Specified"}</span></span>
                        </div>

                        {/* Files Downloads list */}
                        <div className="flex flex-col gap-1.5 pt-1">
                          {reg.aadhaar_doc_url && (
                            <a
                              href={reg.aadhaar_doc_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold text-[10px] shadow-sm transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" /> Aadhaar Card Copy
                            </a>
                          )}
                          {reg.qualification_doc_url && (
                            <a
                              href={reg.qualification_doc_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold text-[10px] shadow-sm transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-[#C00000]" /> Qualification Doc
                            </a>
                          )}
                          {reg.experience_cert_url ? (
                            <a
                              href={reg.experience_cert_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold text-[10px] shadow-sm transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" /> Experience Proof
                            </a>
                          ) : reg.working_sector && reg.working_sector !== "Student / Unemployed" ? (
                            <span className="text-slate-400 italic text-[10px] pl-1.5">No experience proof uploaded</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Action Desk */}
                    {reg.status === "PENDING" && (
                      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrollment Application Review</span>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Provide review remarks (optional)..."
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(reg.id, "REJECTED")}
                            disabled={actionLoading}
                            className="px-4 py-2 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold text-rose-600 dark:text-rose-300 rounded-lg transition-colors cursor-pointer"
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
                      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">Course Completed?</span>
                          <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">You can now generate the graduation certificate and dispatch it to the student&apos;s email.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startIssuance(reg)}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                        >
                          {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <Award className="w-4 h-4" /> Issue Graduation Certificate
                        </button>
                      </div>
                    )}

                    {reg.status === "APPROVED" && issuingId === reg.id && (
                      <div className="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none text-left">
                        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                          <Award className="w-5 h-5 text-[#001C55] dark:text-blue-400" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Configure Certificate Credentials</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Father&apos;s Name</label>
                            <input
                              type="text"
                              value={certForm.fatherName}
                              onChange={(e) => setCertForm({ ...certForm, fatherName: e.target.value })}
                              placeholder="Student's Father Name"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#001C55]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Grade / Percentage</label>
                            <input
                              type="text"
                              value={certForm.grade}
                              onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                              placeholder="e.g. A+, A, Outstanding"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#001C55]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Duration From</label>
                            <input
                              type="date"
                              value={certForm.durationFrom}
                              onChange={(e) => setCertForm({ ...certForm, durationFrom: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#001C55]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Duration To</label>
                            <input
                              type="date"
                              value={certForm.durationTo}
                              onChange={(e) => setCertForm({ ...certForm, durationTo: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#001C55]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Training Venue</label>
                            <input
                              type="text"
                              value={certForm.venue}
                              onChange={(e) => setCertForm({ ...certForm, venue: e.target.value })}
                              placeholder="e.g. Online (DKFFJ Portal)"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#001C55]"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 mb-1">Performance/Conduct Rating</label>
                            <input
                              type="text"
                              value={certForm.performance}
                              onChange={(e) => setCertForm({ ...certForm, performance: e.target.value })}
                              placeholder="e.g. Excellent, Very Good"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-[#001C55]"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
                          <button
                            type="button"
                            onClick={() => setIssuingId(null)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => submitIssuance(reg.id)}
                            disabled={actionLoading}
                            className="px-5 py-2.5 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <Award className="w-4 h-4" /> Generate & Dispatch Certificate
                          </button>
                        </div>
                      </div>
                    )}

                    {reg.status === "COMPLETED" && (
                      <div className="p-4 bg-emerald-50/45 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-100">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            Course completed. Certificate has been generated and dispatched.
                          </div>
                          {reg.certificates && reg.certificates[0] && reg.certificates[0].pdf_url && (
                            <a
                              href={reg.certificates[0].pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Certificate
                            </a>
                          )}
                        </div>
                        
                        {reg.certificates && reg.certificates[0] && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2.5 border-t border-emerald-100/60 dark:border-emerald-500/20 font-semibold text-slate-700 dark:text-slate-300">
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Certificate No</span>
                              <span className="text-slate-800 dark:text-slate-100 font-mono mt-0.5 block">{reg.certificates[0].certificate_no}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Completion Date</span>
                              <span className="text-slate-800 dark:text-slate-100 mt-0.5 block">
                                {new Date(reg.certificates[0].issue_date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Grade Awarded</span>
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold mt-0.5 block">{reg.certificates[0].grade || "A"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Performance Rating</span>
                              <span className="text-slate-800 dark:text-slate-100 mt-0.5 block">{reg.certificates[0].performance || "Excellent"}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {reg.remarks && (
                      <div className="p-3 bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400 font-semibold italic">
                        &ldquo;Board Notes: {reg.remarks}&rdquo;
                      </div>
                    )}

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
