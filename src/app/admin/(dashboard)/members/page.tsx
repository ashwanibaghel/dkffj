"use client";

import React, { useState, useEffect } from "react";
import { getMemberships, getSignedDocumentUrl, updateMembershipStatus } from "./actions";
import { Users, FileCheck, XCircle, Search, Eye, Download, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Award, IdCard } from "lucide-react";
import { generateMembershipPDFClient } from "./MembershipCertificateGenerator";
import { generateMembershipIdCardPDFClient } from "./MembershipIdCardGenerator";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
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
      const data = await getMemberships();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    setFilteredMembers(result);
  }, [filter, searchQuery, members]);

  const handleOpenPrivateDoc = async (bucket: string, path: string) => {
    try {
      const res = await getSignedDocumentUrl(bucket, path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank");
      } else {
        showToast(res.error || "Failed to generate file access token.", "error");
      }
    } catch (err) {
      showToast("Error fetching document link.", "error");
    }
  };

  const handleDownloadCertificate = async (member: any) => {
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
    } catch (err: any) {
      console.error(err);
      showToast(`Error generating certificate: ${err.message || err}`, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadIdCard = async (member: any) => {
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

      const pdfBlob = await generateMembershipIdCardPDFClient({
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

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_ID_Card_${certNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("ID Card downloaded successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Error generating ID Card: ${err.message || err}`, "error");
    } finally {
      setDownloadingIdCardId(null);
    }
  };

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await updateMembershipStatus(id, newStatus, remarks);
      if (res.success) {
        setRemarks("");
        setExpandedId(null);
        await fetchData(); // Refresh data
        showToast(`Membership status updated to ${newStatus} successfully!`, "success");
      } else {
        setActionError(res.error || "Failed to process membership change.");
        showToast(res.error || "Failed to process membership change.", "error");
      }
    } catch (err) {
      setActionError("Error updating membership status.");
      showToast("Error updating membership status.", "error");
    } finally {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#001C55]" /> NGO Membership Board
          </h1>
          <p className="text-slate-500 text-xs mt-1">Review applicant profiles, specimen files, and issue membership certificates.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === f
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f === "ALL" ? "All Applications" : f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by name, ACK, ID..."
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
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading applicant profiles, please wait...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">No matching membership applications found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
          {filteredMembers.map((member) => {
            const isExpanded = expandedId === member.id;
            return (
              <div key={member.id} className="transition-all">
                {/* Collapsed Header View */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : member.id)}
                  className={`p-4 flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-slate-50/50 transition-colors ${
                    isExpanded ? "bg-slate-50/50 border-b border-slate-100" : ""
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{member.full_name}</h4>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">ACK: {member.ack_no}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Contact Info</span>
                      <span className="text-slate-650 block mt-0.5">{member.email}</span>
                      <span className="text-slate-650 block mt-0.5">{member.mobile}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Membership ID</span>
                      <span className="text-slate-800 block mt-0.5 font-mono font-bold">
                        {member.membership_no || "NOT GENERATED"}
                      </span>
                    </div>
                    <div className="self-center flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Column: Personal Photo */}
                      <div className="flex flex-col items-center border border-slate-200/60 bg-white rounded-xl p-4 text-center">
                        <img
                          src={member.photo_url || "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=300"}
                          alt={member.full_name}
                          className="w-28 h-28 object-cover rounded-xl border"
                        />
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
                          <span className="text-slate-800 mt-0.5 block text-[#001C55] font-bold">{member.designation}</span>
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
