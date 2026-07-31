"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getMemberships, getSignedDocumentUrl, updateMembershipStatus, updateMembershipFields, dispatchMembershipWelcomeEmail, getMemberPrintData, addMemberByAdminAction, updateMemberValidityAction, toggleMemberShowHomeAction, toggleMemberActiveStatusAction, deleteMembership } from "./actions";
import { Users, Search, Eye, Download, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Award, IdCard, Edit, Upload, Clock, ShieldCheck, UserPlus, X, XCircle, FileUp, Check, Calendar, RefreshCw, Home, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { generateMembershipPDFClient } from "./MembershipCertificateGenerator";
import { generateMembershipIdCardPDFClient } from "./MembershipIdCardGenerator";
import { uploadFileToStorage, uploadMembershipDocs } from "@/lib/uploadToStorage";
import AdminEmptyState from "../components/AdminEmptyState";
import { AdminConfirmDialog } from "../components/AdminFeedback";
import { indiaStatesDistricts } from "@/lib/data/indiaStatesDistricts";
import { MEMBERSHIP_TIERS, MEMBERSHIP_TIERS_LIST, autoDetectMembershipLevel, MembershipLevelKey } from "@/lib/data/membershipTiers";

const PROFESSIONS = [
  "Service", "Business", "Private Sector", "Government Sector", "House Wife", "Retired", "Unemployed", "Student"
];

const EDUCATION_OPTIONS = [
  "High School (10th)",
  "Intermediate (12th)",
  "Diploma",
  "B.A. (Bachelor of Arts)",
  "B.Sc. (Bachelor of Science)",
  "B.Com. (Bachelor of Commerce)",
  "B.Tech. (Bachelor of Technology)",
  "B.C.A. (Bachelor of Computer Applications)",
  "B.B.A. (Bachelor of Business Administration)",
  "LLB (Bachelor of Laws)",
  "BA LLB (Integrated Law)",
  "B.Ed. (Bachelor of Education)",
  "M.A. (Master of Arts)",
  "M.Sc. (Master of Science)",
  "M.Com. (Master of Commerce)",
  "M.Tech. (Master of Technology)",
  "M.C.A. (Master of Computer Applications)",
  "M.B.A. (Master of Business Administration)",
  "LLM (Master of Laws)",
  "Ph.D. (Doctor of Philosophy)",
  "Other"
];

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
  show_home?: boolean;
  membership_no?: string | null;
  ack_no: string;
  approved_at?: string | null;
  valid_until?: string | null;
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
  const [activeTab, setActiveTab] = useState<"current" | "migrated">("current");

  // Administrative action states
  const [remarks, setRemarks] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>("");

  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    fullName: "",
    fatherName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    gender: "Male",
    dob: "",
    address: "",
    state: "Uttar Pradesh",
    district: "Kanpur Nagar",
    pincode: "208001",
    education: "Graduate",
    profession: "Social Worker",
    workingArea: "Human Rights & Social Welfare",
    designation: "Member",
    policeStation: "",
    membershipNo: ""
  });
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");
  const [editAadhaarFile, setEditAadhaarFile] = useState<File | null>(null);
  const [editSignatureFile, setEditSignatureFile] = useState<File | null>(null);

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    fatherName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    gender: "Male",
    dob: "1995-01-01",
    address: "",
    state: "Uttar Pradesh",
    district: "Kanpur Nagar",
    pincode: "208001",
    education: "Graduate",
    profession: "Social Worker",
    workingArea: "Human Rights & Social Welfare",
    designation: "Member",
    policeStation: "",
    paymentStatus: "DONE" as "DONE" | "NOT_DONE"
  });

  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null);
  const [addAadhaarFile, setAddAadhaarFile] = useState<File | null>(null);
  const [addSignatureFile, setAddSignatureFile] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addProgressStep, setAddProgressStep] = useState<string>("");
  const [addError, setAddError] = useState<string>("");
  const [addSuccessMsg, setAddSuccessMsg] = useState<string>("");

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccessMsg("");

    if (!addForm.fullName.trim() || !addForm.fatherName.trim() || !addForm.mobile.trim() || !addForm.email.trim() || !addForm.address.trim()) {
      setAddError("Please fill in all required personal details.");
      return;
    }

    if (!addPhotoFile || !addAadhaarFile || !addSignatureFile) {
      setAddError("Please upload all 3 required files: Passport Photo, Aadhaar Card, and Signature.");
      return;
    }

    setAddLoading(true);
    try {
      // 1. Upload files to Supabase Storage
      const userIdStr = "admin_add_" + Date.now();
      const docsRes = await uploadMembershipDocs(
        userIdStr,
        addPhotoFile,
        addAadhaarFile,
        addSignatureFile,
        (step) => setAddProgressStep(step)
      );

      if (docsRes.error || !docsRes.photoUrl || !docsRes.aadhaarUrl || !docsRes.signatureUrl) {
        throw new Error(docsRes.error || "Failed to upload files to cloud storage.");
      }

      setAddProgressStep("Creating member record in database...");

      // 2. Call server action to create member
      const createRes = await addMemberByAdminAction({
        fullName: addForm.fullName,
        fatherName: addForm.fatherName,
        gender: addForm.gender,
        dob: addForm.dob,
        mobile: addForm.mobile,
        whatsapp: addForm.whatsapp || addForm.mobile,
        email: addForm.email,
        address: addForm.address,
        state: addForm.state,
        district: addForm.district,
        pincode: addForm.pincode,
        education: addForm.education,
        profession: addForm.profession,
        workingArea: addForm.workingArea,
        designation: addForm.designation,
        policeStation: addForm.policeStation,
        photoUrl: docsRes.photoUrl,
        aadhaarUrl: docsRes.aadhaarUrl,
        signatureUrl: docsRes.signatureUrl,
        paymentStatus: addForm.paymentStatus
      });

      if (!createRes.success || !createRes.member) {
        throw new Error(createRes.error || "Failed to create member record.");
      }

      // 3. If Payment Done, generate Certificate & ID Card and dispatch Welcome Email
      if (addForm.paymentStatus === "DONE" && createRes.membershipNo) {
        setAddProgressStep("Generating Certificate & ID Card PDFs...");
        const newMember = createRes.member;

        const certNo = createRes.membershipNo;
        const verificationUrl = `https://www.dkffj.org/verify/${certNo}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;

        const issueDateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" });

        // Generate Certificate
        const certRes = await generateMembershipPDFClient({
          membershipNo: certNo,
          ackNo: newMember.ack_no,
          fullName: newMember.full_name,
          fatherName: newMember.father_name,
          designation: newMember.designation,
          workingArea: newMember.working_area || "Human Rights Protection",
          photoUrl: docsRes.photoUrl,
          issueDateStr,
          qrCodeUrl,
          verificationUrl
        });

        // Generate ID Card
        const idCardRes = await generateMembershipIdCardPDFClient({
          membershipNo: certNo,
          ackNo: newMember.ack_no,
          fullName: newMember.full_name,
          fatherName: newMember.father_name,
          designation: newMember.designation,
          workingArea: newMember.working_area || "Human Rights Protection",
          photoUrl: docsRes.photoUrl,
          issueDateStr,
          validFromStr: issueDateStr,
          validToStr: newMember.valid_until ? new Date(newMember.valid_until).toISOString().split("T")[0] : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
          addressStr: newMember.address,
          districtStr: newMember.district,
          stateStr: newMember.state,
          pincodeStr: newMember.pincode,
          mobileStr: newMember.mobile,
          qrCodeUrl,
          verificationUrl
        });

        // Upload PDFs to Storage
        setAddProgressStep("Uploading documents for candidate email...");
        const ts = Date.now();
        const certPdfFile = new File([certRes.pdfBlob], `cert_${ts}.pdf`, { type: "application/pdf" });
        const certPngFile = new File([certRes.pngBlob], `cert_${ts}.png`, { type: "image/png" });
        const idCardPdfFile = new File([idCardRes.pdfBlob], `idcard_${ts}.pdf`, { type: "application/pdf" });
        const idCardPngFile = new File([idCardRes.pngBlob], `idcard_${ts}.png`, { type: "image/png" });

        const [certPdfRes, certPngRes, idPdfRes, idPngRes] = await Promise.all([
          uploadFileToStorage(certPdfFile, "documents", `${newMember.id}/cert_${ts}.pdf`),
          uploadFileToStorage(certPngFile, "documents", `${newMember.id}/cert_${ts}.png`),
          uploadFileToStorage(idCardPdfFile, "documents", `${newMember.id}/idcard_${ts}.pdf`),
          uploadFileToStorage(idCardPngFile, "documents", `${newMember.id}/idcard_${ts}.png`)
        ]);

        // Send Email
        setAddProgressStep("Sending welcome email with attachments...");
        await dispatchMembershipWelcomeEmail(newMember.id, {
          certPdfUrl: certPdfRes.url,
          certPngUrl: certPngRes.url,
          idCardPdfUrl: idPdfRes.url,
          idCardPngUrl: idPngRes.url
        });
      }

      setAddSuccessMsg(createRes.message || "Member created successfully!");
      showToast(createRes.message || "Member created successfully!", "success");
      await fetchData();
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setAddError(getErrorMessage(err));
      showToast(getErrorMessage(err), "error");
    } finally {
      setAddLoading(false);
      setAddProgressStep("");
    }
  };

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
    setEditForm({
      id: member.id,
      fullName: member.full_name || "",
      fatherName: member.father_name || "",
      mobile: member.mobile || "",
      whatsapp: member.whatsapp || member.mobile || "",
      email: member.email || "",
      gender: member.gender || "Male",
      dob: member.dob ? member.dob.split("T")[0] : "",
      address: member.address || "",
      state: member.state || "Uttar Pradesh",
      district: member.district || "Kanpur Nagar",
      pincode: member.pincode || "",
      education: member.education || "Graduate",
      profession: member.profession || "Social Worker",
      workingArea: member.working_area || "Human Rights & Social Welfare",
      designation: member.designation || "Member",
      policeStation: member.police_station || "",
      membershipNo: member.membership_no || ""
    });
    setEditPhotoFile(null);
    setEditPhotoPreview(member.photo_url || "");
    setEditAadhaarFile(null);
    setEditSignatureFile(null);
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
      let photoUrl = "";
      if (editPhotoFile) {
        const photoRes = await uploadFileToStorage(
          editPhotoFile,
          "photos",
          `${memberId}/photo_${Date.now()}.${editPhotoFile.name.split(".").pop() || "jpg"}`
        );
        if (photoRes.error || !photoRes.url) {
          throw new Error(photoRes.error || "Failed to upload new photo.");
        }
        photoUrl = photoRes.url;
      }

      let aadhaarUrl = "";
      if (editAadhaarFile) {
        const aadhaarRes = await uploadFileToStorage(
          editAadhaarFile,
          "aadhaar",
          `${memberId}/aadhaar_${Date.now()}.${editAadhaarFile.name.split(".").pop() || "jpg"}`
        );
        if (aadhaarRes.error || !aadhaarRes.url) {
          throw new Error(aadhaarRes.error || "Failed to upload new Aadhaar document.");
        }
        aadhaarUrl = aadhaarRes.url;
      }

      let signatureUrl = "";
      if (editSignatureFile) {
        const sigRes = await uploadFileToStorage(
          editSignatureFile,
          "signatures",
          `${memberId}/signature_${Date.now()}.${editSignatureFile.name.split(".").pop() || "jpg"}`
        );
        if (sigRes.error || !sigRes.url) {
          throw new Error(sigRes.error || "Failed to upload new signature specimen.");
        }
        signatureUrl = sigRes.url;
      }

      const res = await updateMembershipFields({
        id: memberId,
        fullName: editForm.fullName,
        fatherName: editForm.fatherName,
        gender: editForm.gender,
        dob: editForm.dob,
        mobile: editForm.mobile,
        whatsapp: editForm.whatsapp,
        email: editForm.email,
        address: editForm.address,
        state: editForm.state,
        district: editForm.district,
        pincode: editForm.pincode,
        education: editForm.education,
        profession: editForm.profession,
        workingArea: editForm.workingArea,
        designation: editForm.designation,
        policeStation: editForm.policeStation,
        membershipNo: editForm.membershipNo,
        photoUrl: photoUrl || undefined,
        aadhaarUrl: aadhaarUrl || undefined,
        signatureUrl: signatureUrl || undefined
      });

      if (res.success) {
        setEditingId(null);
        setEditPhotoFile(null);
        setEditAadhaarFile(null);
        setEditSignatureFile(null);
        await fetchData(); // Refresh data
        showToast("Membership profile & documents updated successfully!", "success");
      } else {
        setActionError(res.error || "Failed to update membership details.");
        showToast(res.error || "Failed to update membership details.", "error");
      }
    } catch (err: unknown) {
      setActionError(getErrorMessage(err) || "Error updating membership details.");
      showToast(getErrorMessage(err) || "Error updating membership details.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Renewal Modal state
  const [renewalMember, setRenewalMember] = useState<MemberRecord | null>(null);
  const [renewalDateStr, setRenewalDateStr] = useState<string>("");
  const [renewalLoading, setRenewalLoading] = useState<boolean>(false);

  const getValidityInfo = (member: MemberRecord) => {
    const joinDate = member.approved_at
      ? new Date(member.approved_at)
      : new Date(member.created_at);
    
    const validUntil = member.valid_until
      ? new Date(member.valid_until)
      : new Date(new Date(joinDate).setFullYear(joinDate.getFullYear() + 1));
    
    const today = new Date();
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusType: "active" | "expiring" | "expired" = "active";
    let label = `Valid Upto: ${validUntil.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
    let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";

    if (diffDays <= 0) {
      statusType = "expired";
      label = `Expired (${validUntil.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })})`;
      badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 animate-pulse";
    } else if (diffDays <= 30) {
      statusType = "expiring";
      label = `Expiring in ${diffDays} days (${validUntil.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })})`;
      badgeClass = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    }

    return { joinDate, validUntil, diffDays, statusType, label, badgeClass };
  };

  const openRenewalModal = (member: MemberRecord) => {
    setRenewalMember(member);
    const joinDate = member.approved_at ? new Date(member.approved_at) : new Date(member.created_at);
    const currentValidUntil = member.valid_until
      ? new Date(member.valid_until)
      : new Date(new Date(joinDate).setFullYear(joinDate.getFullYear() + 1));
    setRenewalDateStr(currentValidUntil.toISOString().split("T")[0]);
  };

  const handleSaveRenewal = async () => {
    if (!renewalMember || !renewalDateStr) return;
    setRenewalLoading(true);
    try {
      const res = await updateMemberValidityAction(renewalMember.id, renewalDateStr);
      if (res.success) {
        showToast(res.message || "Validity date updated!", "success");
        setRenewalMember(null);
        await fetchData();
      } else {
        showToast(res.error || "Failed to update validity", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update validity", "error");
    } finally {
      setRenewalLoading(false);
    }
  };

  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteMember = async (memberId: string) => {
    setDeletingMemberId(memberId);
    try {
      const res = await deleteMembership(memberId);
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        showToast("Member application deleted successfully.", "success");
      } else {
        showToast(res.error || "Failed to delete member.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "An error occurred while deleting.", "error");
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleQuickAddOneYear = () => {
    if (!renewalDateStr) {
      const baseDate = new Date();
      baseDate.setFullYear(baseDate.getFullYear() + 1);
      setRenewalDateStr(baseDate.toISOString().split("T")[0]);
      return;
    }
    const curr = new Date(renewalDateStr);
    if (isNaN(curr.getTime())) {
      const baseDate = new Date();
      baseDate.setFullYear(baseDate.getFullYear() + 1);
      setRenewalDateStr(baseDate.toISOString().split("T")[0]);
    } else {
      curr.setFullYear(curr.getFullYear() + 1);
      setRenewalDateStr(curr.toISOString().split("T")[0]);
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

  const handleToggleShowHome = async (member: MemberRecord) => {
    try {
      const res = await toggleMemberShowHomeAction(member.id, !!member.show_home);
      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, show_home: res.showHome } : m))
        );
        showToast(
          res.showHome ? `${member.full_name} is now visible on Homepage!` : `${member.full_name} is hidden from Homepage!`,
          "success"
        );
      } else {
        showToast(res.error || "Failed to update homepage visibility", "error");
      }
    } catch {
      showToast("Error updating homepage visibility", "error");
    }
  };

  const handleToggleActiveStatus = async (member: MemberRecord) => {
    try {
      const res = await toggleMemberActiveStatusAction(member.id, member.status);
      if (res.success && res.status) {
        const nextStatus = res.status;
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
        );
        showToast(
          nextStatus === "APPROVED" ? `${member.full_name} status set to Active (APPROVED)!` : `${member.full_name} status set to Inactive!`,
          "success"
        );
      } else {
        showToast(res.error || "Failed to update active status", "error");
      }
    } catch {
      showToast("Error updating active status", "error");
    }
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

  const statusFilters = ["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "HOMEPAGE"];

  const tabMembers = useMemo(() => {
    return members.filter((m) => {
      const isMigrated =
        m.is_migrated ||
        m.remarks === "MIGRATED_PHP" ||
        m.remarks === "Migrated from Executive Council Board Registry" ||
        m.remarks === "MIGRATED_EXECUTIVE_COUNCIL" ||
        (m.ack_no && (m.ack_no.startsWith("DKE-EXEC-") || m.ack_no.startsWith("DKF-EXEC-") || m.ack_no.startsWith("DKE-MIG-") || m.ack_no.startsWith("DKF-MIG-"))) ||
        (m.membership_no && (m.membership_no.startsWith("DKE-EXEC-") || m.membership_no.startsWith("DKF-EXEC-")));
      return activeTab === "migrated" ? isMigrated : !isMigrated;
    });
  }, [members, activeTab]);

  const statusCounts = useMemo(() => {
    return tabMembers.reduce(
      (acc, member) => {
        acc.ALL += 1;
        acc[member.status] = (acc[member.status] || 0) + 1;
        if (member.show_home) acc.HOMEPAGE = (acc.HOMEPAGE || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [tabMembers]);

  const filteredMembers = useMemo(() => {
    let result = tabMembers;
    if (filter !== "ALL") {
      if (filter === "HOMEPAGE") {
        result = result.filter((m) => !!m.show_home);
      } else {
        result = result.filter((m) => m.status === filter);
      }
    }
    if (searchQuery.trim() !== "") {
      const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      result = result.filter((m) => {
        const searchableText = [
          m.full_name,
          m.father_name,
          m.email,
          m.mobile,
          m.whatsapp,
          m.ack_no,
          m.membership_no,
          m.designation,
          m.working_area,
          m.district,
          m.state,
          m.address,
          m.profession,
          m.education,
          m.pincode,
          m.police_station,
          m.remarks
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return queryTerms.every((term) => searchableText.includes(term));
      });
    }
    return result;
  }, [filter, searchQuery, tabMembers]);

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
      const certNo = member.membership_no || member.ack_no;
      const verificationUrl = `https://www.dkffj.org/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
      
      // Fetch latest database status and pre-resolve images to base64
      const printRes = await getMemberPrintData(member.id, qrCodeUrl);
      if (!printRes.success || !printRes.member) {
        throw new Error(printRes.error || "Failed to fetch latest membership details");
      }
      const latestMember = printRes.member;
      
      const issueDateStr = latestMember.approved_at 
        ? new Date(latestMember.approved_at).toLocaleDateString("en-IN")
        : new Date(latestMember.created_at).toLocaleDateString("en-IN");

      // Generate the PDF
      const certRes = await generateMembershipPDFClient({
        membershipNo: latestMember.membership_no || "",
        ackNo: latestMember.ack_no,
        fullName: latestMember.full_name,
        fatherName: latestMember.father_name,
        designation: latestMember.designation,
        workingArea: latestMember.working_area,
        photoUrl: latestMember.photo_url,
        issueDateStr,
        qrCodeUrl,
        verificationUrl
      }, printRes.photoBase64, printRes.qrBase64);

      // Trigger local browser download
      const url = window.URL.createObjectURL(certRes.pdfBlob);
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
      const certNo = member.membership_no || member.ack_no;
      const verificationUrl = `https://www.dkffj.org/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
      
      // Fetch latest database status and pre-resolve images to base64
      const printRes = await getMemberPrintData(member.id, qrCodeUrl);
      if (!printRes.success || !printRes.member) {
        throw new Error(printRes.error || "Failed to fetch latest membership details");
      }
      const latestMember = printRes.member;

      const issueDate = latestMember.approved_at ? new Date(latestMember.approved_at) : new Date(latestMember.created_at);
      const issueDateStr = issueDate.toLocaleDateString("en-IN");
      
      const validFromStr = issueDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const validToDate = latestMember.valid_until
        ? new Date(latestMember.valid_until)
        : new Date(new Date(issueDate).setFullYear(issueDate.getFullYear() + 1));
      const validToStr = validToDate.toISOString().split("T")[0]; // YYYY-MM-DD

      const idRes = await generateMembershipIdCardPDFClient({
        membershipNo: latestMember.membership_no || "",
        ackNo: latestMember.ack_no,
        fullName: latestMember.full_name,
        fatherName: latestMember.father_name,
        designation: latestMember.designation,
        workingArea: latestMember.working_area,
        photoUrl: latestMember.photo_url,
        issueDateStr,
        validFromStr,
        validToStr,
        addressStr: latestMember.address || "",
        districtStr: latestMember.district || "",
        stateStr: latestMember.state || "",
        pincodeStr: latestMember.pincode || "",
        mobileStr: latestMember.mobile || "",
        qrCodeUrl,
        verificationUrl
      }, printRes.photoBase64, printRes.qrBase64);

      // 1. Download PDF
      const pdfUrl = window.URL.createObjectURL(idRes.pdfBlob);
      const aPdf = document.createElement("a");
      aPdf.href = pdfUrl;
      aPdf.download = `Membership_ID_Card_${certNo}.pdf`;
      document.body.appendChild(aPdf);
      aPdf.click();
      document.body.removeChild(aPdf);
      window.URL.revokeObjectURL(pdfUrl);

      // 2. Download PNG
      const pngUrl = window.URL.createObjectURL(idRes.pngBlob);
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
              const certNo = generatedMembershipNo || member.ack_no;
              const verificationUrl = `https://www.dkffj.org/verify/${certNo}`;
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
              
              // Fetch latest print data (incl. base64 photo and QR) from the server
              const printRes = await getMemberPrintData(id, qrCodeUrl);
              if (!printRes.success || !printRes.member) {
                throw new Error(printRes.error || "Failed to load printable details from database.");
              }
              const latestMember = printRes.member;

              const issueDateStr = new Date().toLocaleDateString("en-IN");

              // 1. Generate Certificate PDF and PNG
              let certPdfBlob: Blob | undefined;
              let certPngBlob: Blob | undefined;
              try {
                const certRes = await generateMembershipPDFClient({
                  membershipNo: certNo,
                  ackNo: latestMember.ack_no,
                  fullName: latestMember.full_name,
                  fatherName: latestMember.father_name,
                  designation: latestMember.designation,
                  workingArea: latestMember.working_area,
                  photoUrl: latestMember.photo_url,
                  issueDateStr,
                  qrCodeUrl,
                  verificationUrl
                }, printRes.photoBase64, printRes.qrBase64);
                certPdfBlob = certRes.pdfBlob;
                certPngBlob = certRes.pngBlob;
              } catch (certErr) {
                console.error("Certificate generation error:", certErr);
              }

              // 2. Generate ID Card PDF and PNG
              let idPdfBlob: Blob | undefined;
              let idPngBlob: Blob | undefined;
              try {
                const validFromStr = new Date().toISOString().split("T")[0];
                const validToDate = new Date();
                validToDate.setFullYear(validToDate.getFullYear() + 1);
                validToDate.setDate(validToDate.getDate() - 1);
                const validToStr = validToDate.toISOString().split("T")[0];

                const idRes = await generateMembershipIdCardPDFClient({
                  membershipNo: certNo,
                  ackNo: latestMember.ack_no,
                  fullName: latestMember.full_name,
                  fatherName: latestMember.father_name,
                  designation: latestMember.designation,
                  workingArea: latestMember.working_area,
                  photoUrl: latestMember.photo_url,
                  issueDateStr,
                  validFromStr,
                  validToStr,
                  addressStr: latestMember.address || "",
                  districtStr: latestMember.district || "",
                  stateStr: latestMember.state || "",
                  pincodeStr: latestMember.pincode || "",
                  mobileStr: latestMember.mobile || "",
                  qrCodeUrl,
                  verificationUrl
                }, printRes.photoBase64, printRes.qrBase64);
                idPdfBlob = idRes.pdfBlob;
                idPngBlob = idRes.pngBlob;
              } catch (idErr) {
                console.error("ID Card generation error:", idErr);
              }

              // 3. Upload available files to Storage
              let certPdfUrl = "";
              let certPngUrl = "";
              let idCardPdfUrl = "";
              let idCardPngUrl = "";

              if (certPdfBlob) {
                const f = new File([certPdfBlob], `Certificate_${certNo}.pdf`, { type: "application/pdf" });
                const r = await uploadFileToStorage(f, "photos", `certificates/${member.id}_cert.pdf`);
                if (!r.error) certPdfUrl = r.url;
              }
              if (certPngBlob) {
                const f = new File([certPngBlob], `Certificate_${certNo}.png`, { type: "image/png" });
                const r = await uploadFileToStorage(f, "photos", `certificates/${member.id}_cert.png`);
                if (!r.error) certPngUrl = r.url;
              }
              if (idPdfBlob) {
                const f = new File([idPdfBlob], `ID_Card_${certNo}.pdf`, { type: "application/pdf" });
                const r = await uploadFileToStorage(f, "photos", `id_cards/${member.id}_id.pdf`);
                if (!r.error) idCardPdfUrl = r.url;
              }
              if (idPngBlob) {
                const f = new File([idPngBlob], `ID_Card_${certNo}.png`, { type: "image/png" });
                const r = await uploadFileToStorage(f, "photos", `id_cards/${member.id}_id.png`);
                if (!r.error) idCardPngUrl = r.url;
              }

              // 4. Call welcome email dispatch server action
              const emailRes = await dispatchMembershipWelcomeEmail(id, {
                certPdfUrl,
                certPngUrl,
                idCardPdfUrl,
                idCardPngUrl
              });

              if (emailRes.success) {
                showToast("ID card & certificate successfully generated and emailed!", "success");
              } else {
                showToast(`Failed to email documents: ${emailRes.error}`, "error");
              }
            } catch (err) {
              console.error("Background files dispatch error:", err);
              showToast("Error in background email dispatch pipeline.", "error");
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAddError("");
              setAddSuccessMsg("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#001C55] hover:bg-[#001236] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Member</span>
          </button>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>{filteredMembers.length} visible of {tabMembers.length} records</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("current");
            setFilter("ALL");
            setExpandedId(null);
          }}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "current"
              ? "border-[#001C55] text-[#001C55] dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          Active Membership Registry
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("migrated");
            setFilter("ALL");
            setExpandedId(null);
          }}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "migrated"
              ? "border-[#001C55] text-[#001C55] dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          Legacy Members Registry
        </button>
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
            placeholder="Search name, father name, designation, city, mobile, ACK..."
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
        <AdminEmptyState
          icon={Users}
          title="No members visible"
          description="No membership applications match the selected status or search query. Try another status or search by name, email, or acknowledgement number."
        />
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
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).onerror = null;
                              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || "Member")}&background=001C55&color=fff`;
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          style={{ display: member.photo_url ? "none" : "flex" }}
                        >
                          <Users className="w-4 h-4" />
                        </div>
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
                    <div className="self-center flex flex-col items-start gap-1.5">
                      {/* Primary Application Status Badge */}
                      {member.status === "UNDER_REVIEW" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>UNDER REVIEW</span>
                        </span>
                      )}
                      {member.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>APPROVED</span>
                        </span>
                      )}
                      {member.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shadow-sm">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>REJECTED</span>
                        </span>
                      )}
                      {member.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>PENDING</span>
                        </span>
                      )}

                      {/* Active/Inactive, Homepage Toggles & Validity Label - ONLY FOR APPROVED MEMBERS */}
                      {member.status === "APPROVED" && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {/* Active/Inactive Toggle Switch */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActiveStatus(member);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            title="Click to set Inactive"
                          >
                            <ToggleRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Active</span>
                          </button>

                          {/* Homepage Visibility Toggle Switch */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleShowHome(member);
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 ${
                              member.show_home
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                            }`}
                            title={member.show_home ? "Click to hide from Homepage" : "Click to show on Homepage"}
                          >
                            {member.show_home ? (
                              <ToggleRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span>{member.show_home ? "Homepage Active" : "Homepage Inactive"}</span>
                          </button>

                          {(() => {
                            const { label, badgeClass } = getValidityInfo(member);
                            return (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRenewalModal(member);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold border flex items-center gap-1 cursor-pointer transition-all hover:scale-105 ${badgeClass}`}
                                title="Click to Renew or Edit Validity Date"
                              >
                                <Calendar className="w-3 h-3 shrink-0" />
                                {label}
                              </span>
                            );
                          })()}
                        </div>
                      )}
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
                  <div className="flex items-center gap-1.5 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmState({
                        isOpen: true,
                        id: member.id,
                        name: member.full_name
                      })}
                      disabled={deletingMemberId === member.id}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:border dark:border-rose-500/20 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                      title="Delete Test Member Application"
                    >
                      {deletingMemberId === member.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <div onClick={() => setExpandedId(isExpanded ? null : member.id)} className="cursor-pointer text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
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
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Active / Inactive & Homepage Toggles ONLY FOR APPROVED MEMBERS */}
                          {member.status === "APPROVED" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleActiveStatus(member)}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                title="Click to set Inactive"
                              >
                                <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Active</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleShowHome(member)}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 ${
                                  member.show_home
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                                }`}
                                title={member.show_home ? "Click to hide from Homepage" : "Click to show on Homepage"}
                              >
                                {member.show_home ? (
                                  <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-slate-400 shrink-0" />
                                )}
                                <span>{member.show_home ? "Homepage Active" : "Homepage Inactive"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openRenewalModal(member)}
                                className="px-3 py-1.5 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-950/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> Renew / Edit Validity
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => startEditing(member)}
                            className="px-3 py-1.5 border border-[#001C55] hover:bg-[#001C55]/5 text-[#001C55] dark:text-blue-300 dark:border-blue-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit Profile
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left Column: Personal Photo */}
                      <div className="flex flex-col items-center border border-slate-200/60 bg-white rounded-xl p-4 text-center">
                        <div className="relative group w-28 h-28">
                          <img
                            src={editingId === member.id ? editPhotoPreview : (member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || "Member")}&background=001C55&color=fff`)}
                            alt={member.full_name}
                            className="h-28 w-28 object-cover rounded-xl border"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).onerror = null;
                              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || "Member")}&background=001C55&color=fff`;
                            }}
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
                      {editingId === member.id ? (
                        <div className="md:col-span-2 space-y-4 text-xs font-semibold">
                          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl space-y-4">
                            <div className="text-[11px] font-black text-[#001C55] dark:text-blue-400 uppercase tracking-wider">
                              Editing Full Profile Details
                            </div>

                            {/* Row 1: Full Name & Father Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  value={editForm.fullName}
                                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Father / Husband Name *</label>
                                <input
                                  type="text"
                                  value={editForm.fatherName}
                                  onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Row 2: Mobile, WhatsApp & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Mobile Number *</label>
                                <input
                                  type="text"
                                  value={editForm.mobile}
                                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">WhatsApp</label>
                                <input
                                  type="text"
                                  value={editForm.whatsapp}
                                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email Address *</label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Row 3: Gender & DOB */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Gender *</label>
                                <select
                                  value={editForm.gender}
                                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Date of Birth *</label>
                                <input
                                  type="date"
                                  value={editForm.dob}
                                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Row 4: Full Address */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Address *</label>
                              <textarea
                                rows={2}
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            {/* Row 5: State, District, Pincode */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">State *</label>
                                <select
                                  value={editForm.state}
                                  onChange={(e) => {
                                    const newSt = e.target.value;
                                    const dists = indiaStatesDistricts.find(s => s.state === newSt)?.districts || [];
                                    setEditForm({
                                      ...editForm,
                                      state: newSt,
                                      district: dists[0] || ""
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                >
                                  {indiaStatesDistricts.map((s) => (
                                    <option key={s.state} value={s.state}>{s.state}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">District *</label>
                                <select
                                  value={editForm.district}
                                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                >
                                  {(indiaStatesDistricts.find(s => s.state === editForm.state)?.districts || []).map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Pincode *</label>
                                <input
                                  type="text"
                                  value={editForm.pincode}
                                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Row 6: Designation & Working Area */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Designation *</label>
                                <select
                                  value={editForm.designation}
                                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 font-bold"
                                >
                                  {DESIGNATIONS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Working Area</label>
                                <input
                                  type="text"
                                  value={editForm.workingArea}
                                  onChange={(e) => setEditForm({ ...editForm, workingArea: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            {/* Row 7: Education & Profession */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Education</label>
                                <select
                                  value={editForm.education}
                                  onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                >
                                  {EDUCATION_OPTIONS.map((e) => (
                                    <option key={e} value={e}>{e}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Profession</label>
                                <select
                                  value={editForm.profession}
                                  onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                >
                                  {PROFESSIONS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Row 8: Membership No & Police Station */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Permanent Membership ID</label>
                                <input
                                  type="text"
                                  placeholder="e.g. DKFFJ/M/2026/0001"
                                  value={editForm.membershipNo}
                                  onChange={(e) => setEditForm({ ...editForm, membershipNo: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Police Station</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Kotwali"
                                  value={editForm.policeStation}
                                  onChange={(e) => setEditForm({ ...editForm, policeStation: e.target.value })}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : (
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
                      )}

                    </div>

                    {/* Private Documents Section */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <FileText className="w-4 h-4 text-[#001C55] dark:text-blue-400" /> Supporting Verification Assets
                      </div>
                      
                      {editingId === member.id ? (
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Aadhaar Upload/Change Button */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => setEditAadhaarFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id={`edit-aadhaar-input-${member.id}`}
                            />
                            <label
                              htmlFor={`edit-aadhaar-input-${member.id}`}
                              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>{editAadhaarFile ? editAadhaarFile.name.substring(0, 12) + "..." : "Upload New Aadhaar"}</span>
                            </label>
                          </div>

                          {/* Signature Upload/Change Button */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditSignatureFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id={`edit-sig-input-${member.id}`}
                            />
                            <label
                              htmlFor={`edit-sig-input-${member.id}`}
                              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>{editSignatureFile ? editSignatureFile.name.substring(0, 12) + "..." : "Upload New Signature"}</span>
                            </label>
                          </div>
                        </div>
                      ) : (
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
                      )}
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#001C55] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-wide uppercase">Add New Member</h2>
                  <p className="text-[11px] text-blue-200">Manual Entry Form for Member Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddMemberSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Error / Success Notifications inside Modal */}
              {addError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{addSuccessMsg}</span>
                </div>
              )}

              {/* Progress Bar when Loading */}
              {addLoading && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>{addProgressStep || "Processing..."}</span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-pulse rounded-full w-3/4"></div>
                  </div>
                </div>
              )}

              {/* Section 1: Personal Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#001C55] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  1. Personal & Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Father / Husband Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shri Suresh Kumar"
                      value={addForm.fatherName}
                      onChange={(e) => setAddForm({ ...addForm, fatherName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={addForm.mobile}
                      onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@example.com"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Gender *</label>
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={addForm.dob}
                      onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House No, Village/Locality, Post..."
                    value={addForm.address}
                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">State *</label>
                    <select
                      required
                      value={addForm.state}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        const distList = indiaStatesDistricts.find(s => s.state === newSt)?.districts || [];
                        setAddForm({
                          ...addForm,
                          state: newSt,
                          district: distList[0] || ""
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      {indiaStatesDistricts.map((s) => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">District *</label>
                    <select
                      required
                      value={addForm.district}
                      onChange={(e) => setAddForm({ ...addForm, district: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      {(indiaStatesDistricts.find(s => s.state === addForm.state)?.districts || []).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={addForm.pincode}
                      onChange={(e) => setAddForm({ ...addForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: NGO Designation & Profile */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-[#001C55] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  2. NGO Designation & Work Field
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Designation *</label>
                    <select
                      value={addForm.designation}
                      onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold"
                    >
                      {DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Working Area / Field</label>
                    <input
                      type="text"
                      placeholder="e.g. Human Rights Protection"
                      value={addForm.workingArea}
                      onChange={(e) => setAddForm({ ...addForm, workingArea: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Education</label>
                    <select
                      value={addForm.education}
                      onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      {EDUCATION_OPTIONS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Profession</label>
                    <select
                      value={addForm.profession}
                      onChange={(e) => setAddForm({ ...addForm, profession: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Document Uploads */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-[#001C55] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  3. Upload Specimen Files *
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  {/* Photo File */}
                  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-950">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Passport Photo *</label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setAddPhotoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="admin-add-photo-input"
                    />
                    <label
                      htmlFor="admin-add-photo-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold hover:bg-blue-100 border border-blue-200 dark:border-blue-800"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{addPhotoFile ? addPhotoFile.name.substring(0, 14) + "..." : "Choose Photo"}</span>
                    </label>
                  </div>

                  {/* Aadhaar File */}
                  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-950">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Aadhaar Card *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={(e) => setAddAadhaarFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="admin-add-aadhaar-input"
                    />
                    <label
                      htmlFor="admin-add-aadhaar-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold hover:bg-blue-100 border border-blue-200 dark:border-blue-800"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{addAadhaarFile ? addAadhaarFile.name.substring(0, 14) + "..." : "Choose Aadhaar"}</span>
                    </label>
                  </div>

                  {/* Signature File */}
                  <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-950">
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Signature Specimen *</label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setAddSignatureFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="admin-add-signature-input"
                    />
                    <label
                      htmlFor="admin-add-signature-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold hover:bg-blue-100 border border-blue-200 dark:border-blue-800"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{addSignatureFile ? addSignatureFile.name.substring(0, 14) + "..." : "Choose Signature"}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 4: Payment Status & Approval Setting */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-[#001C55] dark:text-blue-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  4. Payment Status & Approval Setting *
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Payment Done */}
                  <label
                    onClick={() => setAddForm({ ...addForm, paymentStatus: "DONE" })}
                    className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition-all ${
                      addForm.paymentStatus === "DONE"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={addForm.paymentStatus === "DONE"}
                      onChange={() => setAddForm({ ...addForm, paymentStatus: "DONE" })}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-emerald-800 dark:text-emerald-400">Payment Done (Paid)</span>
                        <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Instant Approval</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Creates member with <strong>APPROVED</strong> status, generates permanent Membership ID, Certificate, ID Card & emails candidate immediately.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Payment Not Done */}
                  <label
                    onClick={() => setAddForm({ ...addForm, paymentStatus: "NOT_DONE" })}
                    className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition-all ${
                      addForm.paymentStatus === "NOT_DONE"
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentStatus"
                      checked={addForm.paymentStatus === "NOT_DONE"}
                      onChange={() => setAddForm({ ...addForm, paymentStatus: "NOT_DONE" })}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-amber-800 dark:text-amber-400">Payment Not Done (Pending)</span>
                        <span className="bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Payment Pending</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Saves member profile in database with <strong>PAYMENT PENDING</strong> status. No certificate or ID card will be generated.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#001C55] hover:bg-[#001236] text-white font-black text-xs uppercase tracking-wider shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{addLoading ? "Processing Member..." : "Submit & Save Member"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Renewal & Validity Date Modal */}
      {renewalMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-4.5 h-4.5 text-[#001C55] dark:text-blue-400" />
                  Renew Membership & Validity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Member: <strong>{renewalMember.full_name}</strong> (ID: {renewalMember.membership_no || renewalMember.ack_no})
                </p>
              </div>
              <button
                onClick={() => setRenewalMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Set Valid Upto Date (Expiration Date) *
                </label>
                <input
                  type="date"
                  value={renewalDateStr}
                  onChange={(e) => setRenewalDateStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#001C55] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleQuickAddOneYear}
                  className="flex-1 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  +1 Year Renewal
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                💡 Updating this date will automatically reflect on the <strong>Valid Till</strong> date printed on future ID Cards and PDF Certificates for this member.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRenewalMember(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRenewal}
                disabled={renewalLoading}
                className="px-5 py-2 bg-[#001C55] hover:bg-[#001236] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {renewalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save Renewal Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Confirmation Dialog */}
      <AdminConfirmDialog
        open={!!deleteConfirmState?.isOpen}
        title="Delete Member Application?"
        message={`Are you sure you want to permanently delete the membership application for "${deleteConfirmState?.name}"? This action cannot be undone and will erase all associated records and payment logs.`}
        confirmLabel="Yes, Delete Permanently"
        cancelLabel="Cancel"
        tone="danger"
        loading={!!deletingMemberId}
        onConfirm={async () => {
          if (deleteConfirmState) {
            await handleDeleteMember(deleteConfirmState.id);
            setDeleteConfirmState(null);
          }
        }}
        onCancel={() => setDeleteConfirmState(null)}
      />
    </div>
  );
}
