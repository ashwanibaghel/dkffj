"use client";

import React, { useState, useEffect } from "react";
import {
  getAffiliationStats,
  getAffiliationsList,
  getAffiliationDetails,
  approveAffiliation,
  rejectAffiliation,
  getSignedDocumentUrl,
  adminEditAffiliation,
  adminRetryRefund,
  adminCheckRefundStatus,
  adminRetryEmail,
  downloadAffiliationAnnexureAction
} from "./actions";
import { fetchNormalizedCoursesAction } from "@/app/affiliation/apply/actions";
import { NormalizedCourse, SectorGroup } from "@/lib/courseCatalog";
import { generateAffiliationPDFClient } from "./AffiliationCertificateGenerator";
import {
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  FileText,
  ShieldCheck,
  Calendar,
  Download,
  Loader2,
  ExternalLink,
  Lock,
  UserCheck,
  MapPin,
  HelpCircle,
  X,
  Sparkles,
  Pencil,
  Upload,
  Save,
  CreditCard,
  RefreshCw,
  Mail,
  Award
} from "lucide-react";

export default function AdminAffiliationsPage() {
  const [stats, setStats] = useState({ total: 0, submitted: 0, approved: 0, rejected: 0 });
  const [list, setList] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [adminCourseMap, setAdminCourseMap] = useState<Record<string, NormalizedCourse>>({});
  const [adminCourseCatalog, setAdminCourseCatalog] = useState<SectorGroup[]>([]);
  const [selectedApprovedCourseIds, setSelectedApprovedCourseIds] = useState<string[]>([]);
  const [downloadingAnnexure, setDownloadingAnnexure] = useState(false);

  // Approve Modal State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validTo, setValidTo] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]);
  const [approveInternalRemarks, setApproveInternalRemarks] = useState("Approved by Executive Board.");
  const [approvePublicRemarks, setApprovePublicRemarks] = useState("Application approved. Official affiliation certificate issued.");
  const [actionLoading, setActionLoading] = useState(false);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectInternalRemarks, setRejectInternalRemarks] = useState("");
  const [rejectPublicRemarks, setRejectPublicRemarks] = useState("Application reviewed and rejected. Does not meet current requirements.");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState<"applicant" | "institute" | "documents">("applicant");
  const [editLoading, setEditLoading] = useState(false);
  // Applicant edit fields
  const [editFullName, setEditFullName] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIdProofType, setEditIdProofType] = useState("");
  const [editIdProofLastFour, setEditIdProofLastFour] = useState("");
  const [editAuthorizedSignatory, setEditAuthorizedSignatory] = useState("");
  // Institute edit fields
  const [editOrgName, setEditOrgName] = useState("");
  const [editOrgType, setEditOrgType] = useState("");
  const [editOrgTypeOther, setEditOrgTypeOther] = useState("");
  const [editRegNo, setEditRegNo] = useState("");
  const [editPan, setEditPan] = useState("");
  const [editEstYear, setEditEstYear] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editState, setEditState] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  // Document replacement files
  const [editDocFiles, setEditDocFiles] = useState<Record<string, File | null>>({});

  // Toast Banner
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Load Data
  const loadData = async () => {
    setLoading(true);
    const s = await getAffiliationStats();
    setStats(s);
    const l = await getAffiliationsList(statusFilter);
    setList(l);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Open Detail Review Modal
  const openReviewModal = async (id: string) => {
    setSelectedId(id);
    setDetailsLoading(true);
    const data = await getAffiliationDetails(id);
    setDetails(data);

    try {
      const cat = await fetchNormalizedCoursesAction();
      if (cat) {
        setAdminCourseMap(cat.courseMap);
        setAdminCourseCatalog(cat.sectorGroups);
      }
    } catch (_) {}

    const reqIds = (data as any)?.requestedCourseIds || [];
    const appIds = (data as any)?.approvedCourseIds || (data?.status === "APPROVED" ? reqIds : reqIds);
    setSelectedApprovedCourseIds(appIds);

    setDetailsLoading(false);
  };

  // Document Download Handler
  const handleDownloadDoc = async (storagePath: string, localUrl?: string) => {
    // In dev mode, if file was saved locally, open directly
    if (localUrl) {
      window.open(localUrl, "_blank");
      return;
    }
    const res = await getSignedDocumentUrl(storagePath);
    if (res.url) {
      window.open(res.url, "_blank");
    } else {
      showToast("error", res.error || "Could not generate download link.");
    }
  };

  // Submit Approval
  const handleConfirmApprove = async () => {
    if (!selectedId) return;
    setActionLoading(true);

    let pdfBase64: string | undefined = undefined;
    if (details) {
      try {
        const photoDoc = details.documents?.find(
          (d: any) =>
            d.documentType === "USER_PHOTO" ||
            d.documentType === "PHOTO" ||
            d.documentType === "PASSPORT_PHOTO" ||
            d.documentType === "HEAD_PHOTO" ||
            d.documentType === "APPLICANT_PHOTO" ||
            d.documentType === "PHOTO_PROOF"
        );

        const today = new Date();
        const nextYear = new Date(Date.now() + 365 * 86400000);

        const parsedFrom = validFrom ? new Date(validFrom) : today;
        const parsedTo = validTo ? new Date(validTo) : nextYear;

        const validFromFormatted = isNaN(parsedFrom.getTime())
          ? today.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
          : parsedFrom.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

        const validToFormatted = isNaN(parsedTo.getTime())
          ? nextYear.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
          : parsedTo.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

        const currentYear = today.getFullYear().toString();
        const affNo = details.affiliationNo || `DKFFJ/F/${currentYear}/0001`;

        const { pdfBlob } = await generateAffiliationPDFClient({
          id: details.id,
          applicationNo: details.applicationNo,
          affiliationNo: affNo,
          verificationToken: details.verificationToken || details.id,
          organizationName: details.organizationName,
          organizationType: details.organizationTypeOther || details.organizationType,
          registrationNumber: details.registrationNumber,
          establishmentYear: details.establishmentYear,
          district: details.district,
          state: details.state,
          address: details.address,
          validFromStr: validFromFormatted,
          validToStr: validToFormatted,
          applicantFullName: details.applicant?.fullName || details.applicantFullName || "Authorized Member",
          applicantDesignation: details.applicant?.designation || details.applicantDesignation || "Director / Representative",
          applicantPhotoUrl: details.photoUrl || photoDoc?.storagePath || photoDoc?.localUrl || null,
          approvedDomains: details.domains?.map((d: any) => (d.domainType ? d.domainType.replace(/_/g, " ") : String(d)))
        });

        const arrayBuf = await pdfBlob.arrayBuffer();
        pdfBase64 = Buffer.from(arrayBuf).toString("base64");
      } catch (err) {
        console.error("Client PDF pre-generation error during approval:", err);
      }
    }

    const res = await approveAffiliation(selectedId, validFrom, validTo, approveInternalRemarks, approvePublicRemarks, pdfBase64, selectedApprovedCourseIds);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", res.message || "Affiliation approved & official certificate emailed!");
      setShowApproveModal(false);
      openReviewModal(selectedId);
      loadData();
    }
    setActionLoading(false);
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!selectedId) return;
    if (!rejectInternalRemarks.trim()) {
      showToast("error", "Internal remarks are required for rejection.");
      return;
    }
    setActionLoading(true);
    const res = await rejectAffiliation(selectedId, rejectInternalRemarks, rejectPublicRemarks);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("info", res.message || "Application marked as REJECTED.");
      setShowRejectModal(false);
      openReviewModal(selectedId);
      loadData();
    }
    setActionLoading(false);
  };

  // Open Edit Modal — pre-fill fields with current data
  const openEditModal = () => {
    if (!details) return;
    setEditFullName(details.applicant?.fullName || "");
    setEditDesignation(details.applicant?.designation || "");
    setEditMobile(details.applicant?.mobile || "");
    setEditWhatsapp(details.applicant?.whatsapp || "");
    setEditEmail(details.applicant?.email || "");
    setEditIdProofType(details.applicant?.idProofType || "");
    setEditIdProofLastFour(details.applicant?.idProofLastFour || "");
    setEditAuthorizedSignatory(details.applicant?.authorizedSignatoryName || "");
    setEditOrgName(details.organizationName || "");
    setEditOrgType(details.organizationType || "");
    setEditOrgTypeOther(details.organizationTypeOther || "");
    setEditRegNo(details.registrationNumber || "");
    setEditPan(details.panNumber || "");
    setEditEstYear(details.establishmentYear || "");
    setEditAddress(details.address || "");
    setEditState(details.state || "");
    setEditDistrict(details.district || "");
    setEditPincode(details.pincode || "");
    setEditWebsite(details.website || "");
    setEditCapacity(details.studentCapacity?.toString() || "");
    setEditDocFiles({});
    setEditTab("applicant");
    setShowEditModal(true);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!selectedId) return;
    setEditLoading(true);
    const fd = new FormData();
    fd.append("fullName", editFullName);
    fd.append("designation", editDesignation);
    fd.append("mobile", editMobile);
    fd.append("whatsapp", editWhatsapp);
    fd.append("email", editEmail);
    fd.append("idProofType", editIdProofType);
    fd.append("idProofLastFour", editIdProofLastFour);
    fd.append("authorizedSignatoryName", editAuthorizedSignatory);
    fd.append("organizationName", editOrgName);
    fd.append("organizationType", editOrgType);
    fd.append("organizationTypeOther", editOrgTypeOther);
    fd.append("registrationNumber", editRegNo);
    fd.append("panNumber", editPan);
    fd.append("establishmentYear", editEstYear);
    fd.append("address", editAddress);
    fd.append("state", editState);
    fd.append("district", editDistrict);
    fd.append("pincode", editPincode);
    fd.append("website", editWebsite);
    fd.append("studentCapacity", editCapacity);
    Object.entries(editDocFiles).forEach(([docType, file]) => {
      if (file) fd.append(`doc_${docType}`, file);
    });
    const res = await adminEditAffiliation(selectedId, fd);
    setEditLoading(false);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", res.message || "Changes saved!");
      setShowEditModal(false);
      openReviewModal(selectedId);
      loadData();
    }
  };

  // Download Affiliation Certificate Handler (Browser PDF & PNG Generation)
  const handleDownloadAffiliationCertificate = async (affiliationData: any) => {
    if (!affiliationData || !affiliationData.affiliationNo) {
      showToast("error", "Affiliation number not generated for this application.");
      return;
    }
    try {
      showToast("info", "Generating Affiliation Certificate PDF...");
      const photoDoc = affiliationData.documents?.find(
        (d: any) =>
          d.documentType === "USER_PHOTO" ||
          d.documentType === "PHOTO" ||
          d.documentType === "PASSPORT_PHOTO" ||
          d.documentType === "HEAD_PHOTO" ||
          d.documentType === "APPLICANT_PHOTO" ||
          d.documentType === "PHOTO_PROOF"
      );

      const today = new Date();
      const nextYear = new Date(Date.now() + 365 * 86400000);

      const parsedFrom = affiliationData.validFrom ? new Date(affiliationData.validFrom) : today;
      const parsedTo = affiliationData.validTo ? new Date(affiliationData.validTo) : nextYear;

      const validFromFormatted = isNaN(parsedFrom.getTime())
        ? today.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        : parsedFrom.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

      const validToFormatted = isNaN(parsedTo.getTime())
        ? nextYear.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        : parsedTo.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

      const { pdfBlob } = await generateAffiliationPDFClient({
        id: affiliationData.id,
        applicationNo: affiliationData.applicationNo,
        affiliationNo: affiliationData.affiliationNo,
        verificationToken: affiliationData.verificationToken || affiliationData.id,
        organizationName: affiliationData.organizationName,
        organizationType: affiliationData.organizationTypeOther || affiliationData.organizationType,
        registrationNumber: affiliationData.registrationNumber,
        establishmentYear: affiliationData.establishmentYear,
        district: affiliationData.district,
        state: affiliationData.state,
        address: affiliationData.address,
        validFromStr: validFromFormatted,
        validToStr: validToFormatted,
        applicantFullName:
          affiliationData.applicantFullName ||
          affiliationData.applicant?.fullName ||
          affiliationData.applicantName ||
          "Authorized Member",
        applicantDesignation:
          affiliationData.applicantDesignation ||
          affiliationData.applicant?.designation ||
          "Director / Representative",
        applicantPhotoUrl: affiliationData.photoUrl || photoDoc?.storagePath || photoDoc?.localUrl || null,
        approvedDomains: affiliationData.domains?.map((d: any) => (d.domainType ? d.domainType.replace(/_/g, " ") : String(d)))
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Affiliation_Certificate_${affiliationData.affiliationNo.replace(/\//g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("success", "Affiliation Certificate PDF downloaded!");
    } catch (error) {
      console.error("Certificate Generation Error:", error);
      showToast("error", "Failed to generate Affiliation Certificate PDF.");
    }
  };

  // Filtered List
  const filteredList = list.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.organizationName.toLowerCase().includes(q) ||
      m.applicationNo.toLowerCase().includes(q) ||
      (m.affiliationNo && m.affiliationNo.toLowerCase().includes(q)) ||
      m.applicantName.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideDown max-w-sm w-full">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : toast.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700"
                : "bg-slate-900 text-slate-100 border-slate-700"
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#001C55] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#001C55]" /> Affiliation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage institutional affiliation applications, review documentation, and issue official certificates.</p>
        </div>
      </div>

      {/* KPI Analytics Cards — Mobile Responsive Scroll / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Applications</span>
          <p className="text-xl sm:text-2xl font-black text-[#001C55] mt-1">{stats.total}</p>
        </div>
        <div className="bg-amber-50/50 border border-amber-200 p-3.5 sm:p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Submitted (Pending)</span>
          <p className="text-xl sm:text-2xl font-black text-amber-900 mt-1">{stats.submitted}</p>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200 p-3.5 sm:p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved Institutes</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-3.5 sm:p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Rejected Applications</span>
          <p className="text-xl sm:text-2xl font-black text-rose-900 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters & Search Toolbar — 100% Mobile Responsive Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
        {/* Horizontal Scrollable Tabs on Mobile */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
          {["ALL", "SUBMITTED", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                statusFilter === st ? "bg-[#001C55] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search org, app no, district..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001C55]"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading affiliations...</div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No affiliation applications found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Application / Affiliation No</th>
                  <th className="px-4 py-3">Institute Name</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">District & State</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#001C55]">{item.applicationNo}</span>
                      {item.affiliationNo && (
                        <span className="block text-[10px] font-mono text-emerald-700 font-bold mt-0.5">{item.affiliationNo}</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-[200px]">
                      <strong className="text-slate-900 font-serif block truncate">{item.organizationName}</strong>
                      <span className="text-[10px] text-slate-400 block">{item.organizationType}</span>
                      {item.hasDuplicateWarning && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Duplicate Warning
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{item.applicantName}</span>
                      <span className="text-[10px] text-slate-400 block">{item.applicantMobile}</span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span>{item.district}, {item.state}</span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {item.createdAt}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          item.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === "APPROVED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadAffiliationCertificate(item);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-sm"
                            title="Download Affiliation Certificate PDF"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-600" /> Certificate
                          </button>
                        )}
                        <button
                          onClick={() => openReviewModal(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#001C55] hover:bg-[#001C55]/90 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review & Process
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 my-auto">
            {detailsLoading || !details ? (
              <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#001C55]" /> Loading application dossier...
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#001C55]">{details.applicationNo}</span>
                      {details.affiliationNo && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {details.affiliationNo}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold font-serif text-slate-900 mt-1">{details.organizationName}</h2>
                    <p className="text-xs text-slate-500">{details.organizationType} • Est. {details.establishmentYear}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedId(null);
                      setDetails(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Duplicate Warning Alert */}
                {details.hasDuplicateWarning && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Admin Duplicate Warning Triggered:</strong>
                      <p className="mt-0.5 text-amber-800">{details.warningDetails || "An existing active affiliation matching name & district was detected."}</p>
                    </div>
                  </div>
                )}

                {/* Grid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Applicant Details Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Applicant Representative</span>
                    <strong className="text-sm text-slate-900 block">{details.applicant?.fullName}</strong>
                    <p className="text-slate-600">{details.applicant?.designation}</p>
                    <div className="pt-1 space-y-1 text-slate-500 text-[11px]">
                      <div>Mobile: <strong>{details.applicant?.mobile}</strong></div>
                      <div>Email: <strong>{details.applicant?.email}</strong></div>
                      <div>ID Proof: <strong>{details.applicant?.idProofType} ({details.applicant?.idProofMasked})</strong></div>
                      <div>Signatory: <strong>{details.applicant?.authorizedSignatoryName}</strong></div>
                    </div>
                  </div>

                  {/* Institute Address & Capacity */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Address & Capacity</span>
                    <p className="text-slate-800 font-semibold">{details.address}</p>
                    <div className="text-slate-600 text-[11px]">
                      <div>Location: <strong>{details.district}, {details.state} - {details.pincode}</strong></div>
                      <div>Reg No: <strong>{details.registrationNumber || "Unregistered"}</strong></div>
                      <div>PAN: <strong>{details.panMasked || "N/A"}</strong></div>
                      <div>Student Capacity: <strong>{details.studentCapacity || "N/A"} per batch</strong></div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">Uploaded Verification Documents ({details.documents.length})</span>
                  <div className="grid grid-cols-1 gap-2">
                    {details.documents.map((doc: any) => (
                      <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2 text-xs overflow-hidden">
                        <div className="min-w-0 flex-1">
                          <strong className="text-slate-800 block truncate">{doc.documentType}</strong>
                          <span className="text-[10px] text-slate-400 block truncate">{doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          onClick={() => handleDownloadDoc(doc.storagePath, doc.localUrl)}
                          className="w-full px-3 py-2 bg-[#001C55] hover:bg-[#001C55]/90 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" /> View / Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requested Programs Review */}
                <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-200 rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2">
                    <div>
                      <span className="text-xs font-extrabold text-[#001C55] uppercase tracking-wider block">
                        Requested Course Authorization ({(details.requestedCourseIds || []).length} Requested)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Check/uncheck programs below to finalize approved courses for Annexure-A.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedApprovedCourseIds(details.requestedCourseIds || [])}
                        className="px-2.5 py-1 bg-[#001C55] hover:bg-[#001C55]/90 text-white rounded-lg text-[10px] font-bold"
                      >
                        Approve All Requested
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedApprovedCourseIds([])}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold"
                      >
                        Reject All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(details.requestedCourseIds || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2 text-center">
                        No specific course IDs recorded for this application.
                      </p>
                    ) : (
                      (details.requestedCourseIds || []).map((cid: string) => {
                        const c = adminCourseMap[cid];
                        const isApproved = selectedApprovedCourseIds.includes(cid);
                        return (
                          <div
                            key={cid}
                            onClick={() =>
                              setSelectedApprovedCourseIds((prev) =>
                                isApproved ? prev.filter((id) => id !== cid) : [...prev, cid]
                              )
                            }
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isApproved ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            <div>
                              <strong className="text-xs block">{c ? c.title : cid}</strong>
                              <span className="text-[10px] opacity-75">{c ? `${c.sector} • ${c.duration}` : "Course ID: " + cid}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                isApproved ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {isApproved ? "APPROVED" : "REJECTED"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="pt-2 text-right border-t border-blue-100 text-[11px] font-bold text-[#001C55]">
                    Final Authorized Count: {selectedApprovedCourseIds.length} Programs
                  </div>
                </div>

                {/* Payment & Refund Information Panel */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Payment & Refund Ledger</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      details.payment?.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                      details.payment?.status === "REFUNDED" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                      details.payment?.status === "REFUND_INITIATED" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                      details.payment?.status === "REFUND_FAILED" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                      "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}>
                      ● {details.payment?.status || "PENDING"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Amount Paid</span>
                      <strong className="text-white text-sm font-mono">₹{details.payment?.amount || 2100}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Transaction ID</span>
                      <strong className="text-slate-200 font-mono text-[11px] truncate block">{details.payment?.transactionId || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Receipt Number</span>
                      <strong className="text-slate-200 font-mono text-[11px] truncate block">{details.payment?.receiptNo || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Paid Date</span>
                      <strong className="text-slate-200 text-[11px] block">{details.payment?.paidAt || "Pending"}</strong>
                    </div>
                  </div>

                  {/* Refund details if applicable */}
                  {details.payment?.refundId && (
                    <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">Refund Ref ID: <code className="text-amber-300">{details.payment.refundId}</code></span>
                        <span className="text-slate-400">Initiated: <strong>{details.payment.refundInitiatedAt || "N/A"}</strong></span>
                      </div>
                      {details.payment.refundedAt && (
                        <p className="text-[10px] text-emerald-400 font-bold">✓ Confirmed Refunded on: {details.payment.refundedAt}</p>
                      )}
                    </div>
                  )}

                  {/* Refund Failed Alert Banner */}
                  {details.payment?.refundStatus === "REFUND_FAILED" && (
                    <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-xs text-rose-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span><strong>Refund Failed:</strong> {details.payment.failureReason || "Gateway issue"}. Action required.</span>
                      </div>
                      <button
                        onClick={async () => {
                          const id = details?.id;
                          if (!id) return;
                          setDetailsLoading(true);
                          const res = await adminRetryRefund(id);
                          setDetailsLoading(false);
                          if (res.error) showToast("error", res.error);
                          else { showToast("success", res.message || "Refund retried successfully."); openReviewModal(id); }
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry Refund
                      </button>
                    </div>
                  )}

                  {/* Admin Utilities / Retry Action Row */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-slate-400 font-bold text-[10px] uppercase mr-1">Admin Tools:</span>
                    {details.payment?.status === "COMPLETED" && (
                      <a
                        href={`/api/affiliation/receipt?orderId=${details.applicationNo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 border border-slate-700 transition-all"
                      >
                        <Download className="w-3 h-3 text-amber-400" /> Receipt PDF
                      </a>
                    )}
                    <button
                      onClick={async () => {
                        const id = details?.id;
                        if (!id) return;
                        const res = await adminRetryEmail(id, "RECEIPT");
                        if (res.error) showToast("error", res.error);
                        else showToast("success", res.message || "Receipt email sent successfully.");
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 border border-slate-700 transition-all"
                    >
                      <Mail className="w-3 h-3 text-blue-400" /> Resend Receipt Email
                    </button>

                    {details.status === "APPROVED" && (
                      <button
                        onClick={async () => {
                          const id = details?.id;
                          if (!id) return;
                          showToast("info", "Generating certificate & sending approval email...");
                          let pdfBase64: string | undefined = undefined;
                          try {
                            const photoDoc = details.documents?.find(
                              (d: any) =>
                                d.documentType === "USER_PHOTO" ||
                                d.documentType === "PHOTO" ||
                                d.documentType === "PASSPORT_PHOTO" ||
                                d.documentType === "HEAD_PHOTO" ||
                                d.documentType === "APPLICANT_PHOTO" ||
                                d.documentType === "PHOTO_PROOF"
                            );

                            const today = new Date();
                            const nextYear = new Date(Date.now() + 365 * 86400000);

                            const parsedFrom = details.validFrom ? new Date(details.validFrom) : today;
                            const parsedTo = details.validTo ? new Date(details.validTo) : nextYear;

                            const validFromFormatted = isNaN(parsedFrom.getTime())
                              ? today.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                              : parsedFrom.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

                            const validToFormatted = isNaN(parsedTo.getTime())
                              ? nextYear.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                              : parsedTo.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

                            const currentYear = today.getFullYear().toString();
                            const affNo = details.affiliationNo || `DKFFJ/F/${currentYear}/0001`;

                            const { pdfBlob } = await generateAffiliationPDFClient({
                              id: details.id,
                              applicationNo: details.applicationNo,
                              affiliationNo: affNo,
                              verificationToken: details.verificationToken || details.id,
                              organizationName: details.organizationName,
                              organizationType: details.organizationTypeOther || details.organizationType,
                              registrationNumber: details.registrationNumber,
                              establishmentYear: details.establishmentYear,
                              district: details.district,
                              state: details.state,
                              address: details.address,
                              validFromStr: validFromFormatted,
                              validToStr: validToFormatted,
                              applicantFullName: details.applicant?.fullName || details.applicantFullName || "Authorized Member",
                              applicantDesignation: details.applicant?.designation || details.applicantDesignation || "Director / Representative",
                              applicantPhotoUrl: details.photoUrl || photoDoc?.storagePath || photoDoc?.localUrl || null,
                              approvedDomains: details.domains?.map((d: any) => (d.domainType ? d.domainType.replace(/_/g, " ") : String(d)))
                            });

                            const arrayBuf = await pdfBlob.arrayBuffer();
                            pdfBase64 = Buffer.from(arrayBuf).toString("base64");
                          } catch (genErr) {
                            console.error("Failed to pre-generate client PDF for resend email:", genErr);
                          }

                          const res = await adminRetryEmail(id, "APPROVAL", pdfBase64);
                          if (res.error) showToast("error", res.error);
                          else showToast("success", res.message || "Approval email sent successfully.");
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 border border-slate-700 transition-all"
                      >
                        <Mail className="w-3 h-3 text-emerald-400" /> Resend Approval Email
                      </button>
                    )}

                    {details.status === "APPROVED" && (
                      <button
                        onClick={async () => {
                          setDownloadingAnnexure(true);
                          const res = await downloadAffiliationAnnexureAction(details.id);
                          setDownloadingAnnexure(false);
                          if (res.error) showToast("error", res.error);
                          else if (res.pdfBase64) {
                            const link = document.createElement("a");
                            link.href = `data:application/pdf;base64,${res.pdfBase64}`;
                            link.download = res.fileName || "Annexure-A.pdf";
                            link.click();
                            showToast("success", "Annexure-A PDF generated & downloaded!");
                          }
                        }}
                        disabled={downloadingAnnexure}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 border border-emerald-600 transition-all shadow"
                      >
                        {downloadingAnnexure ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3 text-emerald-300" />}
                        Download Annexure-A PDF
                      </button>
                    )}

                    {details.payment?.refundId && (
                      <button
                        onClick={async () => {
                          const id = details?.id;
                          if (!id) return;
                          const res = await adminCheckRefundStatus(id);
                          if (res.error) showToast("error", res.error);
                          else { showToast("success", res.message || "Refund status checked."); openReviewModal(id); }
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1 border border-slate-700 transition-all"
                      >
                        <RefreshCw className="w-3 h-3 text-purple-400" /> Check Refund Status
                      </button>
                    )}
                  </div>
                </div>

                {/* Approved Certificate PDF Download (If Approved) */}
                {details.status === "APPROVED" && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <strong className="text-xs font-bold text-emerald-950 block">Official Certificate Issued (v{details.certificateVersion || 1})</strong>
                      <span className="text-[11px] text-emerald-700 font-mono">Valid: {details.validFrom} to {details.validTo}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadAffiliationCertificate(details)}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0"
                    >
                      <Award className="w-4 h-4" /> Download Certificate PDF
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Left side — Edit */}
                  <button
                    onClick={openEditModal}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit Application
                  </button>

                  {/* Right side — Reject / Approve */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {details.status !== "REJECTED" && details.status !== "APPROVED" && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all text-center"
                        >
                          Reject &amp; Refund Fee
                        </button>
                        <button
                          onClick={() => {
                            if (details.payment?.status !== "COMPLETED") {
                              showToast("error", "Cannot approve application until payment of ₹2,100 is completed.");
                              return;
                            }
                            setShowApproveModal(true);
                          }}
                          disabled={details.payment?.status !== "COMPLETED"}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                            details.payment?.status === "COMPLETED"
                              ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                              : "bg-slate-400 cursor-not-allowed opacity-60"
                          }`}
                          title={details.payment?.status !== "COMPLETED" ? "Payment must be completed before approval" : ""}
                        >
                          <ShieldCheck className="w-4 h-4" /> Approve &amp; Issue Certificate
                        </button>
                      </>
                    )}
                    {details.status === "APPROVED" && (
                      <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 text-center">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Application Approved &amp; Certificate Issued
                      </div>
                    )}
                    {details.status === "REJECTED" && (
                      <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 text-center">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" /> Application Rejected
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Admin Edit Modal ─────────────────────────────── */}
      {showEditModal && details && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto">
            {/* Edit Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10 rounded-t-3xl">
              <div>
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-black text-indigo-700">Edit Application</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{details.applicationNo} — {details.organizationName}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amber Warning Banner */}
            <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Admin Edit Mode.</strong> All changes are permanently logged in the audit trail. Edit only after verifying with the applicant.</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mx-6 mt-4 bg-slate-100 p-1 rounded-xl">
              {(["applicant", "institute", "documents"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEditTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    editTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab === "applicant" ? "Applicant" : tab === "institute" ? "Institute" : "Documents"}
                </button>
              ))}
            </div>

            {/* Tab: Applicant Details */}
            {editTab === "applicant" && (
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input value={editFullName} onChange={e => setEditFullName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                    <input value={editDesignation} onChange={e => setEditDesignation(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile No. *</label>
                    <input value={editMobile} onChange={e => setEditMobile(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp No.</label>
                    <input value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ID Proof Type</label>
                    <select value={editIdProofType} onChange={e => setEditIdProofType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving Licence">Driving Licence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ID Last 4 Digits</label>
                    <input maxLength={4} value={editIdProofLastFour} onChange={e => setEditIdProofLastFour(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Authorized Signatory Name *</label>
                    <input value={editAuthorizedSignatory} onChange={e => setEditAuthorizedSignatory(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Institute Details */}
            {editTab === "institute" && (
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Organization Name *</label>
                    <input value={editOrgName} onChange={e => setEditOrgName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization Type *</label>
                    <input value={editOrgType} onChange={e => setEditOrgType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Establishment Year *</label>
                    <input value={editEstYear} onChange={e => setEditEstYear(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Registration No.</label>
                    <input value={editRegNo} onChange={e => setEditRegNo(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PAN Number</label>
                    <input value={editPan} onChange={e => setEditPan(e.target.value.toUpperCase())} maxLength={10} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Address *</label>
                    <textarea rows={2} value={editAddress} onChange={e => setEditAddress(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State *</label>
                    <input value={editState} onChange={e => setEditState(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">District *</label>
                    <input value={editDistrict} onChange={e => setEditDistrict(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                    <input value={editPincode} onChange={e => setEditPincode(e.target.value)} maxLength={6} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Capacity</label>
                    <input type="number" value={editCapacity} onChange={e => setEditCapacity(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Website URL</label>
                    <input type="url" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Documents */}
            {editTab === "documents" && (
              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-500">Select a new file to <strong>replace</strong> that document. Leave blank to keep the existing file.</p>
                <div className="space-y-2">
                  {[
                    { key: "PASSPORT_PHOTO", label: "Passport Photo" },
                    { key: "REGISTRATION_CERTIFICATE", label: "Registration Certificate" },
                    { key: "PAN", label: "PAN Card" },
                    { key: "ID_PROOF", label: "ID Proof Document" },
                    { key: "BUILDING_INSIDE", label: "Building Photo (Inside)" },
                    { key: "BUILDING_OUTSIDE", label: "Building Photo (Outside)" },
                    { key: "LAB", label: "Lab Photo" }
                  ].map(({ key, label }) => {
                    const existing = details.documents.find((d: any) => d.documentType === key);
                    const newFile = editDocFiles[key];
                    return (
                      <div key={key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800">{label}</strong>
                          {existing && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              Current: {existing.fileName}
                            </span>
                          )}
                          {!existing && <span className="text-[10px] text-slate-400">No file uploaded</span>}
                        </div>
                        <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border-2 border-dashed transition-all ${
                          newFile ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-500 hover:border-indigo-300"
                        }`}>
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{newFile ? newFile.name : `Replace ${label}...`}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0] || null;
                              setEditDocFiles(prev => ({ ...prev, [key]: f }));
                            }}
                          />
                        </label>
                        {newFile && (
                          <button
                            onClick={() => setEditDocFiles(prev => ({ ...prev, [key]: null }))}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-bold"
                          >
                            ✕ Remove — keep existing
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Edit Modal Footer */}
            <div className="p-6 pt-0 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
              >
                {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Action Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-serif font-bold text-slate-900">Approve Affiliation & Grant Certificate</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Validity Start Date *</label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Validity End Date *</label>
                <input
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Public Remarks (Visible on verification page)</label>
                <textarea
                  rows={2}
                  value={approvePublicRemarks}
                  onChange={(e) => setApprovePublicRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#001C55]"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Action Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-serif font-bold text-slate-900">Reject Affiliation Application</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Remarks (Mandatory for audit trail) *</label>
                <textarea
                  rows={2}
                  value={rejectInternalRemarks}
                  onChange={(e) => setRejectInternalRemarks(e.target.value)}
                  placeholder="State clear reasons for rejection"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Public Remarks</label>
                <textarea
                  rows={2}
                  value={rejectPublicRemarks}
                  onChange={(e) => setRejectPublicRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
