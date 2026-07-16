"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getMemberships, getSignedDocumentUrl, updateMembershipStatus, updateMembershipFields, dispatchMembershipWelcomeEmail } from "./actions";
import { Users, Search, Eye, Download, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Award, IdCard, Edit, Upload, Clock, ShieldCheck } from "lucide-react";
import { generateMembershipPDFClient } from "./MembershipCertificateGenerator";
import { generateMembershipIdCardPDFClient } from "./MembershipIdCardGenerator";
import { uploadFileToStorage } from "@/lib/uploadToStorage";

const DESIGNATIONS = [
  "DIRECTOR", "ADD DIRECTOR", "National President", "PRESIDENT", "Secretary",
  "Executive President", "Chief Executive Officer", "Deputy Executive President",
  "Vice President", "Deputy Vice President", "General Secretary", "National Secretary",
  "National Co-ordinator", "Chief Secretary", "Deputy Chief Secretary", "Joint Secretary",
  "Chief Observer", "Deputy Chief Observer", "Chief Reporting Officer",
  "Deputy Chief Reporting Officer", "Chief Co-ordinator", "Co-ordinator",
  "Deputy Chief Co-ordinator", "Minority Welfare Secretary", "Women Empowerment Secretary",
  "Social Welfare Secretary", "Consumer Welfare Secretary", "Human Welfare Secretary",
  "Administrative Secretary", "Information Secretary", "Organising Secretary",
  "Legal Advisor", "Social Media Activist", "Human Rights Activist", "Member",
  "RTI Activist", "Nodal Officer", "Social Activist", "Brand Ambassador",
  "Spokesperson", "Content Writer", "System Administrator", "General Counsel",
  "IT Cell Incharge", "YouTube Media Partner", "Chartered Accountant", "Other"
];

type MemberRecord = {
  id: string;
  user_id?: string;
  full_name: string;
  father_name: string;
  gender: string;
  dob: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  education: string;
  profession: string;
  working_area: string;
  designation: string;
  police_station?: string | null;
  photo_url?: string | null;
  aadhaar_url: string;
  signature_url: string;
  status: string;
  membership_no?: string | null;
  ack_no: string;
  approved_at?: string | null;
  created_at: string;
  remarks?: string | null;
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingIdCardId, setDownloadingIdCardId] = useState<string | null>(null);

  // Administrative action states
  const [remarks, setRemarks] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");

  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesignation, setEditDesignation] = useState<string>("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getMemberships();
      setMembers(data as MemberRecord[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const startEditing = (member: MemberRecord) => {
    setEditingId(member.id);
    setEditDesignation(member.designation);
    setEditPhotoFile(null);
    setEditPhotoPreview(member.photo_url || "");
  };

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhotoFile(file);
      setEditPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (memberId: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      const formData = new FormData();
      formData.append("id", memberId);
      formData.append("designation", editDesignation);
      if (editPhotoFile) {
        formData.append("photo", editPhotoFile);
      }
      
      const res = await updateMembershipFields(formData);
      if (res.success) {
        setEditingId(null);
        setEditPhotoFile(null);
        await fetchData(); // Refresh data
        showToast("Membership details updated successfully!", "success");
      } else {
        setActionError(res.error || "Failed to update membership details.");
        showToast(res.error || "Failed to update membership details.", "error");
      }
    } catch (err: unknown) {
      setActionError(getErrorMessage(err) || "Error updating membership details.");
      showToast("Error updating membership details.", "error");
    } finally {
      setActionLoading(false);
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

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"];

  const statusCounts = useMemo(() => {
    return members.reduce(
      (acc, member) => {
        acc.ALL += 1;
        acc[member.status] = (acc[member.status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (filter !== "ALL") {
      result = result.filter((m) => m.status === filter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.ack_no.toLowerCase().includes(q) ||
          (m.membership_no && m.membership_no.toLowerCase().includes(q))
      );
    }
    return result;
  }, [filter, searchQuery, members]);

  const handleOpenPrivateDoc = async (bucket: string, path: string) => {
    try {
      const res = await getSignedDocumentUrl(bucket, path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank");
      } else {
        showToast(res.error || "Failed to generate file access token.", "error");
      }
    } catch {
      showToast("Error fetching document link.", "error");
    }
  };

  const handleDownloadCertificate = async (member: MemberRecord) => {
    setDownloadingId(member.id);
    try {
      const appUrl = window.location.origin;
      const certNo = member.membership_no || member.ack_no;
      const verificationUrl = `${appUrl}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDateStr = member.approved_at 
        ? new Date(member.approved_at).toLocaleDateString("en-IN")
        : new Date(member.created_at).toLocaleDateString("en-IN");

      // Generate the PDF
      const pdfBlob = await generateMembershipPDFClient({
        membershipNo: member.membership_no || "",
        ackNo: member.ack_no,
        fullName: member.full_name,
        fatherName: member.father_name,
        designation: member.designation,
        workingArea: member.working_area,
        photoUrl: member.photo_url,
        issueDateStr,
        qrCodeUrl,
        verificationUrl
      });

      // Trigger local browser download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_Certificate_${certNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("Certificate downloaded successfully!", "success");
    } catch (err: unknown) {
      console.error(err);
      showToast(`Error generating certificate: ${getErrorMessage(err)}`, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadIdCard = async (member: MemberRecord) => {
    setDownloadingIdCardId(member.id);
    try {
      const appUrl = window.location.origin;
      const certNo = member.membership_no || member.ack_no;
      const verificationUrl = `${appUrl}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDate = member.approved_at ? new Date(member.approved_at) : new Date(member.created_at);
      const issueDateStr = issueDate.toLocaleDateString("en-IN");
      
      const validFromStr = issueDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const validToDate = new Date(issueDate);
      validToDate.setFullYear(validToDate.getFullYear() + 1);
      validToDate.setDate(validToDate.getDate() - 1);
      const validToStr = validToDate.toISOString().split("T")[0]; // YYYY-MM-DD

      const { pdfBlob, pngBlob } = await generateMembershipIdCardPDFClient({
        membershipNo: member.membership_no || "",
        ackNo: member.ack_no,
        fullName: member.full_name,
        fatherName: member.father_name,
        designation: member.designation,
        workingArea: member.working_area,
        photoUrl: member.photo_url,
        issueDateStr,
        validFromStr,
        validToStr,
        addressStr: member.address || "",
        districtStr: member.district || "",
        stateStr: member.state || "",
        pincodeStr: member.pincode || "",
        mobileStr: member.mobile || "",
        qrCodeUrl,
        verificationUrl
      });

      // 1. Download PDF
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const aPdf = document.createElement("a");
      aPdf.href = pdfUrl;
      aPdf.download = `Membership_ID_Card_${certNo}.pdf`;
      document.body.appendChild(aPdf);
      aPdf.click();
      document.body.removeChild(aPdf);
      window.URL.revokeObjectURL(pdfUrl);

      // 2. Download PNG
      const pngUrl = window.URL.createObjectURL(pngBlob);
      const aPng = document.createElement("a");
      aPng.href = pngUrl;
      aPng.download = `Membership_ID_Card_${certNo}.png`;
      document.body.appendChild(aPng);
      aPng.click();
      document.body.removeChild(aPng);
      window.URL.revokeObjectURL(pngUrl);

      showToast("ID Card PDF & PNG downloaded successfully!", "success");
    } catch (err: unknown) {
      console.error(err);
      showToast(`Error generating ID Card: ${getErrorMessage(err)}`, "error");
    } finally {
      setDownloadingIdCardId(null);
    }
  };

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(true);
    setActionError("");

    const member = members.find((m) => m.id === id);
    if (!member) {
      setActionError("Member record not found.");
      showToast("Member record not found.", "error");
      setActionLoading(false);
      return;
    }

    try {
      const res = await updateMembershipStatus(id, newStatus, remarks);
      if (res.success) {
        const generatedMembershipNo = res.membershipNo;
        setRemarks("");
        setExpandedId(null);
        
        // Update local state instantly without full screen reloading
        setMembers((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: newStatus,
                  membership_no: generatedMembershipNo || m.membership_no,
                  remarks: remarks || m.remarks,
                  approved_at: newStatus === "APPROVED" ? new Date().toISOString() : m.approved_at,
                }
              : m
          )
        );

        showToast(`Membership status updated to ${newStatus} successfully!`, "success");
        setActionLoading(false);

        // Async Document Generation and Email Dispatch
        if (newStatus === "APPROVED") {
          (async () => {
            showToast("Generating official ID card & certificate in background...", "success");
            try {
              const appUrl = window.location.origin;
              const certNo = generatedMembershipNo || member.ack_no;
              const verificationUrl = `${appUrl}/verify/${certNo}`;
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
              const issueDateStr = new Date().toLocaleDateString("en-IN");

              // 1. Generate Certificate PDF and PNG
              const { pdfBlob: certPdfBlob, pngBlob: certPngBlob } = await generateMembershipPDFClient({
                membershipNo: certNo,
                ackNo: member.ack_no,
                fullName: member.full_name,
                fatherName: member.father_name,
                designation: member.designation,
                workingArea: member.working_area,
                photoUrl: member.photo_url,
                issueDateStr,
                qrCodeUrl,
                verificationUrl
              });

              // 2. Generate ID Card PDF and PNG
              const validFromStr = new Date().toISOString().split("T")[0];
              const validToDate = new Date();
              validToDate.setFullYear(validToDate.getFullYear() + 1);
              validToDate.setDate(validToDate.getDate() - 1);
              const validToStr = validToDate.toISOString().split("T")[0];

              const { pdfBlob: idPdfBlob, pngBlob: idPngBlob } = await generateMembershipIdCardPDFClient({
                membershipNo: certNo,
                ackNo: member.ack_no,
                fullName: member.full_name,
                fatherName: member.father_name,
                designation: member.designation,
                workingArea: member.working_area,
                photoUrl: member.photo_url,
                issueDateStr,
                validFromStr,
                validToStr,
                addressStr: member.address || "",
                districtStr: member.district || "",
                stateStr: member.state || "",
                pincodeStr: member.pincode || "",
                mobileStr: member.mobile || "",
                qrCodeUrl,
                verificationUrl
              });

              // 3. Convert Blobs to files for uploading
              const certPdfFile = new File([certPdfBlob], `Certificate_${certNo}.pdf`, { type: "application/pdf" });
              const certPngFile = new File([certPngBlob], `Certificate_${certNo}.png`, { type: "image/png" });
              const idCardPdfFile = new File([idPdfBlob], `ID_Card_${certNo}.pdf`, { type: "application/pdf" });
              const idCardPngFile = new File([idPngBlob], `ID_Card_${certNo}.png`, { type: "image/png" });

              // 4. Upload to public bucket
              const uploadCertPdf = await uploadFileToStorage(certPdfFile, "photos", `certificates/${member.id}_cert.pdf`);
              const uploadCertPng = await uploadFileToStorage(certPngFile, "photos", `certificates/${member.id}_cert.png`);
              const uploadIdPdf = await uploadFileToStorage(idCardPdfFile, "photos", `id_cards/${member.id}_id.pdf`);
              const uploadIdPng = await uploadFileToStorage(idCardPngFile, "photos", `id_cards/${member.id}_id.png`);

              if (uploadCertPdf.error || uploadCertPng.error || uploadIdPdf.error || uploadIdPng.error) {
                console.error("Document upload failed");
                showToast("Background document upload failed. Welcome email could not be sent.", "error");
                return;
              }

              // 5. Call welcome email dispatch server action
              const emailRes = await dispatchMembershipWelcomeEmail(id, {
                certPdfUrl: uploadCertPdf.url,
                certPngUrl: uploadCertPng.url,
                idCardPdfUrl: uploadIdPdf.url,
                idCardPngUrl: uploadIdPng.url
              });

              if (emailRes.success) {
                showToast("ID card & certificate successfully attached and emailed to applicant!", "success");
              } else {
                showToast(`Failed to email documents: ${emailRes.error}`, "error");
              }
            } catch (err) {
              console.error("Background files dispatch error:", err);
              showToast("Error generating and dispatching ID card & certificate.", "error");
            }
          })();
        }
      } else {
        setActionError(res.error || "Failed to process membership change.");
        showToast(res.error || "Failed to process membership change.", "error");
        setActionLoading(false);
      }
    } catch (err) {
      console.error(err);
      setActionError("Error updating membership status.");
      showToast("Error updating membership status.", "error");
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === "APPROVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "UNDER_REVIEW") return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> NGO Membership Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review applicant profiles, specimen files, and issue membership certificates.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>{filteredMembers.length} visible of {members.length} records</span>
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
              {f === "ALL" ? "All Applications" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search name, ACK, member ID, email..."
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading applicant profiles, please wait...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">No matching membership applications found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="hidden lg:grid grid-cols-[minmax(240px,1.4fr)_minmax(220px,1fr)_minmax(160px,0.8fr)_minmax(150px,0.7fr)_96px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sticky top-0 z-10">
            <span>Applicant</span>
            <span>Contact</span>
            <span>Member ID</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredMembers.map((member) => {
            const isExpanded = expandedId === member.id;
            return (
              <div key={member.id} className="transition-all">
                {/* Collapsed Header View */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : member.id)}
                  className={`p-4 lg:px-5 lg:py-3 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    isExpanded ? "bg-blue-50/40 dark:bg-blue-500/5 border-b border-slate-100 dark:border-slate-800" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1.4fr)_minmax(220px,1fr)_minmax(160px,0.8fr)_minmax(150px,0.7fr)_96px] gap-4 flex-1 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate">{member.full_name}</h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block font-mono">ACK: {member.ack_no}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Contact Info</span>
                      <span className="text-slate-700 dark:text-slate-300 block mt-0.5 truncate">{member.email}</span>
                      <span className="text-slate-500 dark:text-slate-400 block mt-0.5">{member.mobile}</span>
                    </div>
                    <div>
                      <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Membership ID</span>
                      <span className="text-slate-800 dark:text-slate-200 block mt-0.5 font-mono font-bold">
                        {member.membership_no || "NOT GENERATED"}
                      </span>
                    </div>
                    <div className="self-center flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-start lg:justify-end gap-2">
                      {member.status === "APPROVED" && (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDownloadCertificate(member)}
                            disabled={downloadingId === member.id || downloadingIdCardId === member.id}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50 border border-slate-200"
                            title="Download Certificate"
                          >
                            {downloadingId === member.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#001C55]" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadIdCard(member)}
                            disabled={downloadingId === member.id || downloadingIdCardId === member.id}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50 border border-slate-200"
                            title="Download ID Card"
                          >
                            {downloadingIdCardId === member.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#001C55]" />
                            ) : (
                              <IdCard className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </button>
                        </div>
                      )}
                      <ShieldCheck className={`hidden lg:block w-4 h-4 ${member.status === "APPROVED" ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`} />
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 ml-4">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/20 border-b border-slate-100 space-y-6">
                    {actionError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    {/* Expanded panel header with Edit Button */}
                    <div className="flex justify-between items-center border-b pb-3 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Review Details</span>
                      {editingId === member.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditPhotoFile(null);
                            }}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveChanges(member.id)}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 bg-[#001C55] text-white rounded-lg hover:bg-[#001236] text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(member)}
                          className="px-3 py-1.5 border border-[#001C55] hover:bg-[#001C55]/5 text-[#001C55] rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Column: Personal Photo */}
                      <div className="flex flex-col items-center border border-slate-200/60 bg-white rounded-xl p-4 text-center">
                        <div className="relative group w-28 h-28">
                          <Image
                            src={editingId === member.id ? editPhotoPreview : (member.photo_url || "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=300")}
                            alt={member.full_name}
                            width={112}
                            height={112}
                            className="h-28 w-28 object-cover rounded-xl border"
                            unoptimized
                          />
                          {editingId === member.id && (
                            <label className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="w-5 h-5 text-white" />
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleEditPhotoChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        {editingId === member.id && (
                          <label className="mt-2 px-2.5 py-1 text-[10px] border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer font-bold text-slate-650 flex items-center gap-1">
                            <Upload className="w-3 h-3 text-slate-500" /> Change Photo
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              onChange={handleEditPhotoChange}
                              className="hidden"
                            />
                          </label>
                        )}
                        <h4 className="font-bold text-slate-800 text-sm mt-3">{member.full_name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Candidate Profile</span>
                      </div>

                      {/* Middle Column: Personal & Professional Data */}
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Father Name</span>
                          <span className="text-slate-800 mt-0.5 block">{member.father_name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Date of Birth (Gender)</span>
                          <span className="text-slate-800 mt-0.5 block">{new Date(member.dob).toLocaleDateString("en-IN")} ({member.gender})</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Residential Address</span>
                          <span className="text-slate-800 mt-0.5 block leading-normal">{member.address}, {member.district}, {member.state} - {member.pincode}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Professional Credentials</span>
                          <span className="text-slate-800 mt-0.5 block">{member.profession} | {member.education}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Desired Designation</span>
                          {editingId === member.id ? (
                            <select
                              value={editDesignation}
                              onChange={(e) => setEditDesignation(e.target.value)}
                              className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white font-bold text-slate-700 cursor-pointer"
                            >
                              {DESIGNATIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-800 mt-0.5 block text-[#001C55] font-bold">{member.designation}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Working Area</span>
                          <span className="text-slate-800 mt-0.5 block">{member.working_area}</span>
                        </div>
                      </div>

                    </div>

                    {/* Private Documents Section */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <FileText className="w-4 h-4 text-[#001C55]" /> Supporting Verification Assets
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPrivateDoc("aadhaar", member.aadhaar_url)}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Aadhaar Card
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPrivateDoc("signatures", member.signature_url)}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Signature
                        </button>
                      </div>
                    </div>

                    {/* Certificate Desk for APPROVED Members */}
                    {member.status === "APPROVED" && (
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <Award className="w-4 h-4 text-emerald-600" /> Membership Certificate & ID Desk
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadCertificate(member)}
                            disabled={downloadingId === member.id || downloadingIdCardId === member.id}
                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {downloadingId === member.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            Download Certificate (PDF)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadIdCard(member)}
                            disabled={downloadingId === member.id || downloadingIdCardId === member.id}
                            className="px-4 py-2 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {downloadingIdCardId === member.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <IdCard className="w-3.5 h-3.5" />
                            )}
                            Download ID Card (PDF)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Desk */}
                    {member.status !== "APPROVED" && member.status !== "REJECTED" && (
                      <div className="border-t pt-5 space-y-4">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Board Review Control</span>
                        
                        <div className="space-y-3">
                          <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add administrative review remarks (optional)..."
                            rows={2}
                            className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAction(member.id, "REJECTED")}
                              disabled={actionLoading}
                              className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              Reject Application
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(member.id, "APPROVED")}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                              Approve & Generate ID
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {member.remarks && (
                      <div className="p-3 bg-slate-50 border rounded-lg text-xs text-slate-500 font-semibold italic">
                        &ldquo;Board Notes: {member.remarks}&rdquo;
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
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-100" />
        ) : (
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-100" />
        )}
        <span>{toast.message}</span>
      </div>

    </div>
  );
}
