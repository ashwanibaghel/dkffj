"use client";

import React, { useState, useEffect, useMemo } from "react";
// Admin Appreciation Panel Page - High Performance Clean Render
import Image from "next/image";
import { 
  getAppreciationApplications, 
  getSignedDocumentUrl, 
  updateAppreciationStatus,
  createDirectAppreciationApplication,
  resendAppreciationCertificateEmail,
  deleteAppreciationApplication
} from "./actions";
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
  X,
  Plus,
  Sparkles,
  Upload,
  UserPlus,
  Mail,
  Send,
  Trash2
} from "lucide-react";
import AdminEmptyState from "../components/AdminEmptyState";
import { AdminConfirmDialog } from "../components/AdminFeedback";
import { AppreciationCertificateRenderer, generateAppreciationPDFClient, generateAppreciationCertFiles } from "./AppreciationCertificateGenerator";
import { uploadFileToStorage } from "@/lib/uploadToStorage";
import { indiaStatesDistricts } from "@/lib/data/indiaStatesDistricts";

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

import { SOCIAL_WORK_FIELDS } from "@/lib/data/socialWorkFields";

function cleanText(str?: string | null): string {
  if (!str) return "";
  let res = str;
  while (res.includes("&amp;")) {
    res = res.replace(/&amp;/g, "&");
  }
  return res
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function cleanAppNo(no?: string) {
  if (!no) return "";
  return no
    .replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/")
    .replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/")
    .replace(/(\d{4})\/-\1-/g, "$1/");
}

function getStatusBadge(status?: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20";
    case "UNDER_REVIEW":
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
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

  // Direct VIP Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [issueSubmitting, setIssueSubmitting] = useState<boolean>(false);
  const [issueError, setIssueError] = useState<string>("");

  // Direct Issue Form State (with strict validations and DD/MM/YYYY date)
  const [issueForm, setIssueForm] = useState({
    fullName: "",
    fatherName: "",
    mobile: "",
    email: "",
    gender: "Male",
    dob: "", // DD/MM/YYYY format
    country: "India",
    state: "Uttar Pradesh",
    district: "Kanpur Nagar",
    pincode: "208019",
    address: "",
    socialWorkField: SOCIAL_WORK_FIELDS[9], // Default: VIP / Govt Service
    description: "Honoris Causa / Distinguished Appreciation Certificate awarded by Executive Board.",
    remarks: "Direct VIP / Free Appreciation Certificate issued by Board."
  });

  const [issuePhotoFile, setIssuePhotoFile] = useState<File | null>(null);
  const [issueIdProofFile, setIssueIdProofFile] = useState<File | null>(null);
  const [issueAchievementFile, setIssueAchievementFile] = useState<File | null>(null);

  // Administrative action states
  const [remarks, setRemarks] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Custom Delete Confirm State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteAppreciation = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deleteAppreciationApplication(id);
      if (res.success) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
        showToast("Application deleted successfully.", "success");
      } else {
        showToast(res.error || "Failed to delete application.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "An error occurred while deleting.", "error");
    } finally {
      setDeletingId(null);
    }
  };

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

  const statusFilters = ["ALL", "APPROVED", "PENDING", "UNDER_REVIEW", "REJECTED"];

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
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          (a.full_name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.application_no || "").toLowerCase().includes(q) ||
          cleanAppNo(a.application_no || "").toLowerCase().includes(q) ||
          (a.district || "").toLowerCase().includes(q) ||
          (a.state || "").toLowerCase().includes(q)
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
      let pdfBase64: string | undefined;
      let jpgBase64: string | undefined;

      // If approving, generate the certificate PDF & JPG to attach to the notification email
      if (newStatus === "APPROVED") {
        const appToApprove = applications.find((a) => a.id === applicationId);
        if (appToApprove) {
          try {
            const refNo = decodeURIComponent(cleanAppNo(appToApprove.application_no)).replace(/%2F/gi, "/");
            const verificationUrl = `https://www.dkffj.org/verify/${refNo}`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
            const issueDateStr = new Date().toLocaleDateString("en-IN");

            showToast("Generating certificate for email attachment...", "success");
            const certFiles = await generateAppreciationCertFiles({
              applicationNo: refNo,
              fullName: appToApprove.full_name,
              socialWorkField: appToApprove.social_work_field,
              issueDateStr,
              qrCodeUrl,
              verificationUrl,
              photoUrl: appToApprove.photo_url || null
            });
            pdfBase64 = certFiles.pdfBase64;
            jpgBase64 = certFiles.jpgBase64;
          } catch (genErr) {
            console.error("Certificate generation failed, approving without attachment:", genErr);
          }
        }
      }

      const res = await updateAppreciationStatus(applicationId, newStatus, remarks, pdfBase64, jpgBase64);
      if (res.success) {
        showToast(`✅ Application ${newStatus}! Candidate notified via email${pdfBase64 ? " with certificate attached" : ""}.`, "success");
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
      const refNo = decodeURIComponent(cleanAppNo(app.application_no)).replace(/%2F/gi, "/");
      const verificationUrl = `https://www.dkffj.org/verify/${refNo}`.replace(/%2F/gi, "/");
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
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

  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendCertificateEmail = async (app: AppreciationApplication) => {
    if (!app.email) {
      showToast("Candidate does not have an email address specified.", "error");
      return;
    }

    setResendingId(app.id);
    showToast(`Generating updated certificate & sending email to ${app.email}...`, "success");

    try {
      const refNo = decodeURIComponent(cleanAppNo(app.application_no)).replace(/%2F/gi, "/");
      const verificationUrl = `https://www.dkffj.org/verify/${refNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
      const issueDateStr = new Date().toLocaleDateString("en-IN");

      // Generate client-side PDF & JPG files using updated renderer template & canonical QR code
      const certFiles = await generateAppreciationCertFiles({
        applicationNo: refNo,
        fullName: app.full_name,
        socialWorkField: app.social_work_field,
        issueDateStr,
        qrCodeUrl,
        verificationUrl,
        photoUrl: app.photo_url || null
      });

      // Call server action to send transactional email with PDF & JPG attachments
      const res = await resendAppreciationCertificateEmail({
        applicationNo: refNo,
        fullName: app.full_name,
        email: app.email,
        socialWorkField: app.social_work_field,
        pdfBase64: certFiles.pdfBase64,
        jpgBase64: certFiles.jpgBase64
      });

      if (res.success) {
        showToast(`Certificate email resent successfully to ${app.email}!`, "success");
      } else {
        showToast(`Email delivery error: ${res.error || "Failed to deliver email."}`, "error");
      }
    } catch (err: any) {
      console.error("Resend certificate email failed:", err);
      showToast(`Error: ${err.message || String(err)}`, "error");
    } finally {
      setResendingId(null);
    }
  };

  // Direct VIP Issue Submission with Strict Constraints Validation
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError("");

    // 1. Required text inputs check
    if (!issueForm.fullName.trim() || !issueForm.fatherName.trim() || !issueForm.address.trim()) {
      setIssueError("Full Name, Father's Name, and Full Residential / Official Address are required.");
      return;
    }

    // 2. Mobile Constraint: 10 Digits Only, No Alphabets (Starts with 6-9)
    const cleanMobile = issueForm.mobile.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setIssueError("Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9 (no letters allowed).");
      return;
    }

    // 3. Email Constraint: Valid Email Format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(issueForm.email.trim())) {
      setIssueError("Please enter a valid email address (e.g. official.email@gov.in).");
      return;
    }

    // 4. Date of Birth Formatting (if provided via calendar date picker YYYY-MM-DD)
    let formattedDob = "";
    if (issueForm.dob) {
      if (issueForm.dob.includes("-")) {
        // Formatted from HTML date picker YYYY-MM-DD -> DD/MM/YYYY
        const parts = issueForm.dob.split("-");
        if (parts.length === 3) {
          formattedDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      } else if (issueForm.dob.includes("/")) {
        formattedDob = issueForm.dob;
      }
    }

    // 5. Pincode Constraint: 6 Digits
    const cleanPincode = issueForm.pincode.replace(/\D/g, "");
    if (cleanPincode && cleanPincode.length !== 6) {
      setIssueError("Pincode must be exactly 6 digits.");
      return;
    }

    setIssueSubmitting(true);

    try {
      const tempId = `vip_${Date.now()}`;

      let photoUrl = "";
      if (issuePhotoFile) {
        const photoRes = await uploadFileToStorage(
          issuePhotoFile,
          "photos",
          `${tempId}/photo_${Date.now()}.${issuePhotoFile.name.split(".").pop() || "jpg"}`
        );
        if (photoRes.url) photoUrl = photoRes.url;
      }

      let idProofUrl = "";
      if (issueIdProofFile) {
        const idRes = await uploadFileToStorage(
          issueIdProofFile,
          "aadhaar",
          `${tempId}/idproof_${Date.now()}.${issueIdProofFile.name.split(".").pop() || "jpg"}`
        );
        if (idRes.url) idProofUrl = idRes.url;
      }

      let achievementProofUrl = "";
      if (issueAchievementFile) {
        const achRes = await uploadFileToStorage(
          issueAchievementFile,
          "aadhaar",
          `${tempId}/achievement_${Date.now()}.${issueAchievementFile.name.split(".").pop() || "jpg"}`
        );
        if (achRes.url) achievementProofUrl = achRes.url;
      }

      let pdfBase64 = "";
      let jpgBase64 = "";
      try {
        const tempAppNo = `DKFFJ/A/${new Date().getFullYear()}/00000`;
        const verificationUrl = `https://www.dkffj.org/verify/${tempAppNo}`.replace(/%2F/gi, "/");
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
        const issueDateStr = new Date().toLocaleDateString("en-IN");

        const certFiles = await generateAppreciationCertFiles({
          applicationNo: tempAppNo,
          fullName: issueForm.fullName.trim(),
          socialWorkField: issueForm.socialWorkField,
          issueDateStr,
          qrCodeUrl,
          verificationUrl,
          photoUrl
        });
        pdfBase64 = certFiles.pdfBase64;
        jpgBase64 = certFiles.jpgBase64;
      } catch (genErr) {
        console.error("Failed to generate email certificate attachments:", genErr);
      }

      const res = await createDirectAppreciationApplication({
        fullName: issueForm.fullName.trim(),
        fatherName: issueForm.fatherName.trim(),
        mobile: cleanMobile,
        email: issueForm.email.trim(),
        gender: issueForm.gender,
        dob: formattedDob,
        address: issueForm.address.trim(),
        country: issueForm.country,
        state: issueForm.state,
        district: issueForm.district,
        pincode: cleanPincode,
        socialWorkField: issueForm.socialWorkField,
        description: issueForm.description,
        remarks: issueForm.remarks,
        photoUrl,
        idProofUrl,
        achievementProofUrl,
        pdfBase64,
        jpgBase64
      });

      if (res.success && res.data) {
        if (res.emailDelivered !== false) {
          showToast(`✅ Appreciation Certificate issued to ${issueForm.fullName}! Email delivered successfully to ${issueForm.email}.`, "success");
        } else {
          showToast(`⚠️ Certificate issued, but email delivery note: ${res.emailError || 'Check sender configuration.'}`, "error");
        }
        setIsIssueModalOpen(false);
        setIssueForm({
          fullName: "",
          fatherName: "",
          mobile: "",
          email: "",
          gender: "Male",
          dob: "",
          country: "India",
          state: "Uttar Pradesh",
          district: "Kanpur Nagar",
          pincode: "208019",
          address: "",
          socialWorkField: SOCIAL_WORK_FIELDS[9],
          description: "Honoris Causa / Distinguished Appreciation Certificate awarded by Board.",
          remarks: "Direct VIP / Free Appreciation Certificate issued by Board."
        });
        setIssuePhotoFile(null);
        setIssueIdProofFile(null);
        setIssueAchievementFile(null);

        await fetchData();
        // Open live certificate preview modal for the newly issued VIP certificate
        setSelectedCertApp(res.data as AppreciationApplication);
      } else {
        setIssueError(res.error || "Failed to issue appreciation certificate.");
      }
    } catch (err: any) {
      console.error("Direct issue exception:", err);
      setIssueError(err.message || "An unexpected error occurred.");
    } finally {
      setIssueSubmitting(false);
    }
  };

  const activeStateObj = indiaStatesDistricts.find((s) => s.state === issueForm.state);
  const districtsList = activeStateObj ? activeStateObj.districts : [];

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
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review submitted social work appreciation certificate applications, issue VIP / Free certificates directly, and generate certificates.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsIssueModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#001C55] to-[#C00000] hover:opacity-95 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Issue VIP / Free Certificate</span>
        </button>
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
                    className={`p-4 lg:px-5 lg:py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 cursor-pointer ${
                      isExpanded ? "bg-blue-50/40 dark:bg-blue-500/5 border-b border-slate-100 dark:border-slate-800" : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-w-0 items-center">
                      <div className="md:col-span-5 flex items-center gap-3 min-w-0">
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

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 leading-tight truncate">
                            {app.full_name}
                          </span>
                          <span className="text-[9.5px] font-mono font-bold text-[#001C55] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-1.5 py-0.5 rounded w-fit shrink-0">
                            {cleanedNo}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                          {app.email} &bull; {app.mobile}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-4 min-w-0 text-xs">
                      <span className="md:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Field</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold block truncate">{cleanText(app.social_work_field)}</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5 truncate">{app.district}, {app.state}</span>
                    </div>

                    <div className="md:col-span-3 flex items-center gap-3">
                      {/* Status pill */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(app.status)}`}>
                        {app.status === "UNDER_REVIEW" ? "Awaiting Review" : app.status}
                      </span>
                    </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-auto">
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmState({
                            isOpen: true,
                            id: app.id,
                            name: app.full_name
                          });
                        }}
                        disabled={deletingId === app.id}
                        className="p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
                        title="Delete Test Application"
                      >
                        {deletingId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Delete</span>
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
                              <strong className="text-slate-800 dark:text-slate-100">{cleanText(app.social_work_field)}</strong>
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
                          <div className="flex flex-wrap items-center gap-2 pt-1">
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

                            <button
                              type="button"
                              disabled={resendingId === app.id}
                              onClick={() => handleResendCertificateEmail(app)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                              title="Resend Certificate Email with attachments to candidate"
                            >
                              {resendingId === app.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                              <span>Resend Email</span>
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

      {/* Direct VIP / Free Certificate Creation Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-[#001C55] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-amber-400 border border-white/20 flex items-center justify-center shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Issue VIP / Free Appreciation Certificate
                  </h3>
                  <p className="text-[11px] text-blue-200 font-medium">Direct Approval Stage &bull; Automated Email & Certificate Delivery</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Form */}
            <form onSubmit={handleIssueSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              {issueError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{issueError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 inline-block mr-1" />
                This certificate will be issued directly in <strong>APPROVED</strong> status (bypassing pending queues). An automated email with the certificate link will be sent to the recipient.
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Recipient Full Name (e.g. IAS Shri Rajesh Kumar) *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={issueForm.fullName}
                    onChange={(e) => setIssueForm({ ...issueForm, fullName: e.target.value })}
                    placeholder="Full Name / Designation"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Father&apos;s Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={issueForm.fatherName}
                    onChange={(e) => setIssueForm({ ...issueForm, fatherName: e.target.value })}
                    placeholder="Father's / Spouse Name"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Mobile Number (10 Digits Only) *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="off"
                    value={issueForm.mobile}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setIssueForm({ ...issueForm, mobile: digits });
                    }}
                    placeholder="10-digit mobile (e.g. 9876543210)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Email Address (Certificate Delivery Target) *
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={issueForm.email}
                    onChange={(e) => setIssueForm({ ...issueForm, email: e.target.value.trim() })}
                    placeholder="official.email@gov.in"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={issueForm.gender}
                    onChange={(e) => setIssueForm({ ...issueForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Date of Birth (Calendar Select)
                  </label>
                  <input
                    type="date"
                    value={issueForm.dob}
                    onChange={(e) => setIssueForm({ ...issueForm, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none font-medium cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    State / Province *
                  </label>
                  <select
                    value={issueForm.state}
                    onChange={(e) => setIssueForm({ ...issueForm, state: e.target.value, district: "" })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  >
                    {indiaStatesDistricts.map((s) => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    District / City *
                  </label>
                  <select
                    value={issueForm.district}
                    onChange={(e) => setIssueForm({ ...issueForm, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  >
                    {districtsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Full Residential / Official Address (House/Office No, Street, Area) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={issueForm.address}
                    onChange={(e) => setIssueForm({ ...issueForm, address: e.target.value })}
                    placeholder="Enter complete office or residential address details..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Pincode (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={issueForm.pincode}
                    onChange={(e) => setIssueForm({ ...issueForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="6-digit pincode"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Social Work Field / Award Category *
                  </label>
                  <select
                    value={issueForm.socialWorkField}
                    onChange={(e) => setIssueForm({ ...issueForm, socialWorkField: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none font-bold"
                  >
                    {SOCIAL_WORK_FIELDS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Social Service Citation / Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                    placeholder="Enter citation narrative to be printed on records..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
                  />
                </div>
              </div>

              {/* Upload Files Section */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Document Attachments (Optional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Passport Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setIssuePhotoFile(e.target.files?.[0] || null)}
                      className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#001C55] file:text-white cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">ID Proof Document</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIssueIdProofFile(e.target.files?.[0] || null)}
                      className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#001C55] file:text-white cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Achievement Proof</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIssueAchievementFile(e.target.files?.[0] || null)}
                      className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#001C55] file:text-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={issueSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#001C55] to-[#C00000] hover:opacity-95 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
                >
                  {issueSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Issuing Certificate...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Issue Certificate & Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  disabled={resendingId === selectedCertApp.id}
                  onClick={() => handleResendCertificateEmail(selectedCertApp)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-95 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  title="Resend Certificate to Candidate Email"
                >
                  {resendingId === selectedCertApp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Resend Email</span>
                </button>

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
                    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=https://www.dkffj.org/verify/${decodeURIComponent(cleanAppNo(selectedCertApp.application_no)).replace(/%2F/gi, "/")}`,
                    verificationUrl: `https://www.dkffj.org/verify/${decodeURIComponent(cleanAppNo(selectedCertApp.application_no)).replace(/%2F/gi, "/")}`,
                    photoUrl: selectedCertApp.photo_url || null
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Confirmation Dialog */}
      <AdminConfirmDialog
        open={!!deleteConfirmState?.isOpen}
        title="Delete Application Record?"
        message={`Are you sure you want to permanently delete the application for "${deleteConfirmState?.name}"? This action cannot be undone and will erase all associated records and payment logs.`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Cancel"
        tone="danger"
        loading={!!deletingId}
        onConfirm={async () => {
          if (deleteConfirmState) {
            await handleDeleteAppreciation(deleteConfirmState.id);
            setDeleteConfirmState(null);
          }
        }}
        onCancel={() => setDeleteConfirmState(null)}
      />
    </div>
  );
}
