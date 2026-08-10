"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { maskPAN, maskIDProof } from "@/lib/affiliation-utils";
import {
  getDevAffiliations,
  findDevAffiliationById,
  updateDevAffiliation
} from "@/lib/affiliation-dev-store";

export async function getAffiliationStats() {
  try {
    const devList = getDevAffiliations().filter((d) => d.status !== "DRAFT");

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { count: total } = await supabase.from("affiliations").select("*", { count: "exact", head: true }).neq("current_status", "DRAFT");
    const { count: submitted } = await supabase.from("affiliations").select("*", { count: "exact", head: true }).eq("current_status", "SUBMITTED");
    const { count: approved } = await supabase.from("affiliations").select("*", { count: "exact", head: true }).eq("current_status", "APPROVED");
    const { count: rejected } = await supabase.from("affiliations").select("*", { count: "exact", head: true }).eq("current_status", "REJECTED");

    const dbTotal = total || 0;
    const dbSubmitted = submitted || 0;
    const dbApproved = approved || 0;
    const dbRejected = rejected || 0;

    const devTotal = devList.length;
    const devSubmitted = devList.filter((d) => d.status === "SUBMITTED").length;
    const devApproved = devList.filter((d) => d.status === "APPROVED").length;
    const devRejected = devList.filter((d) => d.status === "REJECTED").length;

    return {
      total: dbTotal + devTotal,
      submitted: dbSubmitted + devSubmitted,
      approved: dbApproved + devApproved,
      rejected: dbRejected + devRejected
    };
  } catch (err) {
    console.error("Error fetching affiliation stats:", err);
    const devList = getDevAffiliations().filter((d) => d.status !== "DRAFT");
    return {
      total: devList.length,
      submitted: devList.filter((d) => d.status === "SUBMITTED").length,
      approved: devList.filter((d) => d.status === "APPROVED").length,
      rejected: devList.filter((d) => d.status === "REJECTED").length
    };
  }
}

export async function getAffiliationsList(statusFilter?: string) {
  try {
    const devList = getDevAffiliations().filter((d) => d.status !== "DRAFT");
    let devFiltered = devList;
    if (statusFilter && statusFilter !== "ALL") {
      devFiltered = devList.filter((d) => d.status === statusFilter);
    }

    const devItemsFormatted = devFiltered.map((d) => ({
      id: d.id,
      applicationNo: d.applicationNo,
      affiliationNo: d.affiliationNo,
      organizationName: d.organizationName,
      organizationType: d.organizationTypeOther || d.organizationType,
      registrationNumber: d.registrationNumber,
      panMasked: d.panMasked,
      district: d.district,
      state: d.state,
      status: d.status,
      hasDuplicateWarning: d.hasDuplicateWarning,
      warningDetails: d.warningDetails,
      applicantName: d.applicant?.fullName || "N/A",
      applicantMobile: d.applicant?.mobile || "N/A",
      applicantEmail: d.applicant?.email || "N/A",
      createdAt: d.createdAt
    }));

    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      let query = supabase
        .from("affiliations")
        .select("*, applicants:affiliation_applicants(*)")
        .neq("current_status", "DRAFT")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "ALL") {
        query = query.eq("current_status", statusFilter);
      }

      const { data: items } = await query;
      if (items && items.length > 0) {
        const dbFormatted = items.map((m: any) => {
          const applicant = Array.isArray(m.applicants) ? m.applicants[0] : m.applicants;
          return {
            id: m.id,
            applicationNo: m.application_no,
            affiliationNo: m.affiliation_no,
            organizationName: m.organization_name,
            organizationType: m.organization_type_other || m.organization_type,
            registrationNumber: m.registration_number,
            panMasked: maskPAN(m.pan_number),
            district: m.district,
            state: m.state,
            status: m.current_status,
            hasDuplicateWarning: m.has_duplicate_warning,
            warningDetails: m.warning_details,
            applicantName: applicant?.full_name || "N/A",
            applicantMobile: applicant?.mobile || "N/A",
            applicantEmail: applicant?.email || "N/A",
            createdAt: new Date(m.created_at).toLocaleDateString("en-IN")
          };
        });
        return [...devItemsFormatted, ...dbFormatted];
      }
    } catch (_) {}

    return devItemsFormatted;
  } catch (err) {
    console.error("Error fetching affiliations list:", err);
    return [];
  }
}

export async function getAffiliationDetails(id: string) {
  try {
    const devItem = findDevAffiliationById(id);
    if (devItem) return devItem;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: m, error } = await supabase
      .from("affiliations")
      .select("*, applicants:affiliation_applicants(*), documents:affiliation_documents(*), domains:affiliation_domains(*), infrastructure:affiliation_infrastructure(*), status_logs(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !m) return null;

    const applicant = Array.isArray(m.applicants) ? m.applicants[0] : m.applicants;
    const documents = Array.isArray(m.documents) ? m.documents : [];
    const domains = Array.isArray(m.domains) ? m.domains : [];
    const infrastructure = Array.isArray(m.infrastructure) ? m.infrastructure : [];
    const statusLogs = Array.isArray(m.status_logs) ? m.status_logs : [];

    return {
      id: m.id,
      applicationNo: m.application_no,
      affiliationNo: m.affiliation_no,
      verificationToken: m.verification_token,
      slug: m.slug,
      organizationName: m.organization_name,
      organizationType: m.organization_type,
      organizationTypeOther: m.organization_type_other,
      registrationNumber: m.registration_number,
      panNumber: m.pan_number,
      panMasked: maskPAN(m.pan_number),
      establishmentYear: m.establishment_year,
      address: m.address,
      state: m.state,
      district: m.district,
      pincode: m.pincode,
      website: m.website,
      studentCapacity: m.student_capacity,
      status: m.current_status,
      hasDuplicateWarning: m.has_duplicate_warning,
      warningDetails: m.warning_details,
      validFrom: m.valid_from ? new Date(m.valid_from).toISOString().split("T")[0] : null,
      validTo: m.valid_to ? new Date(m.valid_to).toISOString().split("T")[0] : null,
      internalRemarks: m.internal_remarks,
      publicRemarks: m.public_remarks,
      createdAt: new Date(m.created_at).toLocaleDateString("en-IN"),
      applicant: applicant
        ? {
            id: applicant.id,
            fullName: applicant.full_name,
            designation: applicant.designation,
            mobile: applicant.mobile,
            whatsapp: applicant.whatsapp,
            email: applicant.email,
            idProofType: applicant.id_proof_type,
            idProofLastFour: applicant.id_proof_last_four,
            idProofMasked: maskIDProof(applicant.id_proof_last_four),
            authorizedSignatoryName: applicant.authorized_signatory_name,
            declarationAcceptedAt: new Date(applicant.declaration_accepted_at).toLocaleDateString("en-IN"),
            declarationIpAddress: applicant.declaration_ip_address
          }
        : null,
      documents: documents.map((d: any) => ({
        id: d.id,
        documentType: d.document_type,
        fileName: d.file_name,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        storagePath: d.storage_path
      })),
      domains: domains.map((d: any) => ({
        id: d.id,
        domainType: d.domain_type,
        domainOther: d.domain_other
      })),
      infrastructure: infrastructure.map((i: any) => ({
        id: i.id,
        infraType: i.infra_type
      })),
      timeline: statusLogs.map((log: any) => ({
        id: log.id,
        fromStatus: log.from_status,
        toStatus: log.to_status,
        remarks: log.remarks,
        date: new Date(log.created_at).toLocaleDateString("en-IN")
      }))
    };
  } catch (err) {
    console.error("Error fetching affiliation details:", err);
    return null;
  }
}

export async function approveAffiliation(
  id: string,
  validFromStr: string,
  validToStr: string,
  internalRemarks?: string,
  publicRemarks?: string,
  customPdfBase64?: string,
  approvedCourseIds?: string[]
) {
  try {
    const devItem = findDevAffiliationById(id);

    // 1. Payment Verification Guard
    const paymentStatus = devItem?.payment?.status;
    if (devItem && paymentStatus !== "COMPLETED") {
      return { error: "Cannot approve application — Payment has not been completed." };
    }

    // 2. Idempotency Guard
    if (devItem && devItem.status === "APPROVED" && devItem.affiliationNo) {
      return {
        success: true,
        affiliationNo: devItem.affiliationNo,
        message: `Application is already APPROVED. Affiliation No: ${devItem.affiliationNo}`
      };
    }

    const approvalYear = new Date().getFullYear().toString();
    const runningNo = String(Math.floor(100 + Math.random() * 900)).padStart(4, "0");
    const affiliationNo = devItem?.affiliationNo || `DKFFJ/F/${approvalYear}/${runningNo}`;

    const validFrom = new Date(validFromStr || Date.now());
    const validTo = new Date(validToStr || new Date().setFullYear(new Date().getFullYear() + 1));
    const newCertVersion = (devItem?.certificateVersion || 0) + 1;

    if (devItem) {
      updateDevAffiliation(id, {
        affiliationNo,
        certificateVersion: newCertVersion,
        approvedCourseIds: approvedCourseIds || devItem.approvedCourseIds || devItem.requestedCourseIds || [],
        status: "APPROVED",
        validFrom: validFrom.toISOString().split("T")[0],
        validTo: validTo.toISOString().split("T")[0],
        renewalDueOn: validTo.toISOString().split("T")[0],
        internalRemarks: internalRemarks || "Approved by Executive Board.",
        publicRemarks: publicRemarks || "Affiliation application approved. Official certificate issued.",
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: "APPROVED",
            remarks: `Approved with Affiliation No: ${affiliationNo} (Certificate v${newCertVersion}). Valid: ${validFrom.toLocaleDateString("en-IN")} to ${validTo.toLocaleDateString("en-IN")}`,
            date: new Date().toLocaleDateString("en-IN")
          }
        ]
      });

      // Send Approval Email with Certificate PDF & Annexure-A Attachments
      try {
        const { getAffiliationApprovalTemplate } = await import("@/services/email/templates");
        const { sendTransactionalEmail } = await import("@/services/email/service");
        const { generateAffiliationCertificatePdfBuffer } = await import("@/lib/affiliationCertificatePdf");
        const { generateAffiliationAnnexurePdfBuffer } = await import("@/lib/affiliationAnnexurePdf");
        const { getNormalizedCourseCatalog } = await import("@/lib/courseCatalog");

        const { courseMap } = await getNormalizedCourseCatalog(false);
        const finalApprovedIds: string[] = approvedCourseIds || devItem.approvedCourseIds || devItem.requestedCourseIds || [];
        const requestedIds: string[] = devItem.requestedCourseIds || [];

        const approvedCourses = finalApprovedIds.map((cid) => courseMap[cid]).filter(Boolean);
        const rejectedIds = requestedIds.filter((cid) => !finalApprovedIds.includes(cid));
        const rejectedCourses = rejectedIds.map((cid) => courseMap[cid]).filter(Boolean);

        const validFromFormatted = validFrom.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const validToFormatted = validTo.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

        const emailHtml = getAffiliationApprovalTemplate(
          devItem.applicant.fullName,
          devItem.organizationName,
          devItem.applicationNo,
          affiliationNo,
          validFromFormatted,
          validToFormatted,
          devItem.verificationToken,
          approvedCourses,
          rejectedCourses
        );

        let attachments: any[] = [];
        try {
          let pdfBuffer: Buffer;
          if (customPdfBase64) {
            pdfBuffer = Buffer.from(customPdfBase64, "base64");
          } else {
            pdfBuffer = await generateAffiliationCertificatePdfBuffer({
              id: devItem.id,
              applicationNo: devItem.applicationNo,
              affiliationNo: affiliationNo,
              verificationToken: devItem.verificationToken || devItem.id,
              organizationName: devItem.organizationName,
              organizationType: devItem.organizationTypeOther || devItem.organizationType,
              registrationNumber: devItem.registrationNumber,
              establishmentYear: devItem.establishmentYear,
              district: devItem.district,
              state: devItem.state,
              address: devItem.address,
              validFromStr: validFromFormatted,
              validToStr: validToFormatted,
              applicantFullName: devItem.applicant.fullName,
              applicantDesignation: devItem.applicant.designation
            });
          }
          attachments.push({
            filename: `Affiliation_Certificate_${affiliationNo.replace(/\//g, "_")}.pdf`,
            content: pdfBuffer
          });
        } catch (pdfErr) {
          console.error("Failed to generate PDF certificate buffer for approval email:", pdfErr);
        }

        try {
          const annexureBuffer = await generateAffiliationAnnexurePdfBuffer({
            affiliationNo: affiliationNo,
            organizationName: devItem.organizationName,
            district: devItem.district,
            state: devItem.state,
            validFrom: validFromFormatted,
            validTo: validToFormatted,
            approvedCourses
          });
          attachments.push({
            filename: `Annexure_A_Approved_Courses_${affiliationNo.replace(/\//g, "_")}.pdf`,
            content: annexureBuffer
          });
        } catch (annexureErr) {
          console.error("Failed to generate Annexure-A PDF buffer for approval email:", annexureErr);
        }

        await sendTransactionalEmail(
          devItem.applicant.email,
          `Your DKFFJ Institute Affiliation Has Been Approved — ${affiliationNo}`,
          emailHtml,
          attachments
        );
      } catch (emailErr) {
        console.error("Failed to send approval email:", emailErr);
      }

      return {
        success: true,
        affiliationNo,
        message: `Affiliation successfully APPROVED. Generated Affiliation No: ${affiliationNo}`
      };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Check payment status in Supabase
    const { data: pay } = await supabase.from("payments").select("status").eq("affiliation_id", id).maybeSingle();
    if (pay && pay.status !== "COMPLETED") {
      return { error: "Cannot approve application — Payment has not been completed." };
    }

    await supabase.from("affiliations").update({
      affiliation_no: affiliationNo,
      certificate_version: newCertVersion,
      current_status: "APPROVED",
      valid_from: validFrom.toISOString(),
      valid_to: validTo.toISOString(),
      renewal_due_on: validTo.toISOString(),
      approved_at: new Date().toISOString(),
      internal_remarks: internalRemarks || "Approved by Executive Board.",
      public_remarks: publicRemarks || "Affiliation application approved. Official certificate issued."
    }).eq("id", id);

    // Fetch details for email
    try {
      const { data: aff } = await supabase
        .from("affiliations")
        .select("*, applicants:affiliation_applicants(*)")
        .eq("id", id)
        .maybeSingle();

      if (aff) {
        const applicant = Array.isArray(aff.applicants) ? aff.applicants[0] : aff.applicants;
        if (applicant?.email) {
          const { getAffiliationApprovalTemplate } = await import("@/services/email/templates");
          const { sendTransactionalEmail } = await import("@/services/email/service");
          const { generateAffiliationCertificatePdfBuffer } = await import("@/lib/affiliationCertificatePdf");
          const { generateAffiliationAnnexurePdfBuffer } = await import("@/lib/affiliationAnnexurePdf");
          const { getNormalizedCourseCatalog } = await import("@/lib/courseCatalog");

          const { courseMap } = await getNormalizedCourseCatalog(false);
          let approvedIds: string[] = approvedCourseIds || [];
          let requestedIds: string[] = [];

          if (approvedIds.length === 0) {
            const { data: dbAppr } = await supabase.from("affiliation_approved_courses").select("course_id").eq("affiliation_id", id);
            approvedIds = (dbAppr || []).map((r: any) => r.course_id);
          }
          const { data: dbReq } = await supabase.from("affiliation_requested_courses").select("course_id").eq("affiliation_id", id);
          requestedIds = (dbReq || []).map((r: any) => r.course_id);

          const approvedCourses = approvedIds.map((cid) => courseMap[cid]).filter(Boolean);
          const rejectedIds = requestedIds.filter((cid) => !approvedIds.includes(cid));
          const rejectedCourses = rejectedIds.map((cid) => courseMap[cid]).filter(Boolean);

          const validFromFormatted = validFrom.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
          const validToFormatted = validTo.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

          const emailHtml = getAffiliationApprovalTemplate(
            applicant.full_name || "Applicant",
            aff.organization_name,
            aff.application_no,
            affiliationNo,
            validFromFormatted,
            validToFormatted,
            aff.verification_token,
            approvedCourses,
            rejectedCourses
          );

          let attachments: any[] = [];
          try {
            const pdfBuffer = await generateAffiliationCertificatePdfBuffer({
              id: aff.id,
              applicationNo: aff.application_no,
              affiliationNo: affiliationNo,
              verificationToken: aff.verification_token || aff.id,
              organizationName: aff.organization_name,
              organizationType: aff.organization_type_other || aff.organization_type,
              registrationNumber: aff.registration_number,
              establishmentYear: aff.establishment_year,
              district: aff.district,
              state: aff.state,
              address: aff.address,
              validFromStr: validFromFormatted,
              validToStr: validToFormatted,
              applicantFullName: applicant.full_name || "Authorized Member",
              applicantDesignation: applicant.designation || "Director / Representative"
            });
            attachments.push({
              filename: `Affiliation_Certificate_${affiliationNo.replace(/\//g, "_")}.pdf`,
              content: pdfBuffer
            });
          } catch (_) {}

          try {
            const annexureBuffer = await generateAffiliationAnnexurePdfBuffer({
              affiliationNo: affiliationNo,
              organizationName: aff.organization_name,
              district: aff.district,
              state: aff.state,
              validFrom: validFromFormatted,
              validTo: validToFormatted,
              approvedCourses
            });
            attachments.push({
              filename: `Annexure_A_Approved_Courses_${affiliationNo.replace(/\//g, "_")}.pdf`,
              content: annexureBuffer
            });
          } catch (_) {}

          await sendTransactionalEmail(
            applicant.email,
            `Your DKFFJ Institute Affiliation Has Been Approved — ${affiliationNo}`,
            emailHtml,
            attachments
          );
        }
      }
    } catch (emailErr) {
      console.error("Supabase approval email error:", emailErr);
    }

    return {
      success: true,
      affiliationNo,
      message: `Affiliation successfully APPROVED. Generated Affiliation No: ${affiliationNo}`
    };
  } catch (err: any) {
    console.error("Error approving affiliation:", err);
    return { error: err.message || "Failed to approve affiliation application." };
  }
}

export async function rejectAffiliation(id: string, internalRemarks: string, publicRemarks: string) {
  try {
    if (!internalRemarks || !internalRemarks.trim()) {
      return { error: "Internal remarks are mandatory for rejection." };
    }

    const devItem = findDevAffiliationById(id);

    // Guard: APPROVED application cannot be rejected or refunded
    if (devItem && devItem.status === "APPROVED") {
      return { error: "Approved applications cannot be rejected or refunded." };
    }

    const isPaid = devItem?.payment?.status === "COMPLETED";
    let refundStatus = devItem?.payment?.refundStatus || null;
    let refundId = devItem?.payment?.refundId || null;
    let refundMessage = "";

    // Initiate Refund if Payment was Completed
    if (devItem && isPaid && (!refundStatus || refundStatus === "REFUND_FAILED")) {
      const { initiatePhonePeRefund } = await import("@/lib/payment/phonepe");
      const { AFFILIATION_FEE_AMOUNT } = await import("@/lib/affiliation-config");

      const refundTxnId = `RF-${devItem.payment?.transactionId || id}`;
      const refundRes = await initiatePhonePeRefund({
        originalTransactionId: devItem.payment?.transactionId || id,
        refundTransactionId: refundTxnId,
        amount: devItem.payment?.amount || AFFILIATION_FEE_AMOUNT
      });

      if (refundRes.success) {
        refundStatus = "REFUND_INITIATED";
        refundId = refundRes.refundId || refundTxnId;
        refundMessage = `Refund of ₹${AFFILIATION_FEE_AMOUNT} initiated (Ref ID: ${refundId}).`;
      } else {
        refundStatus = "REFUND_FAILED";
        refundMessage = `⚠️ Refund initiation failed: ${refundRes.error || "Gateway error"}. Click 'Retry Refund' in admin panel.`;
      }
    }

    if (devItem) {
      updateDevAffiliation(id, {
        status: "REJECTED",
        internalRemarks: internalRemarks.trim(),
        publicRemarks: publicRemarks?.trim() || "Application rejected upon review.",
        payment: devItem.payment ? {
          ...devItem.payment,
          status: refundStatus === "REFUND_INITIATED" ? "REFUND_INITIATED" : devItem.payment.status,
          refundId,
          refundAmount: devItem.payment.amount || 2100,
          refundStatus: refundStatus as any,
          refundInitiatedAt: new Date().toLocaleDateString("en-IN")
        } : undefined,
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: "REJECTED",
            remarks: `Rejected: ${internalRemarks.trim()}. ${refundMessage}`,
            date: new Date().toLocaleDateString("en-IN")
          }
        ]
      });

      // Send Rejection Email
      try {
        const { getAffiliationRejectionTemplate } = await import("@/services/email/templates");
        const { sendTransactionalEmail } = await import("@/services/email/service");

        const emailHtml = getAffiliationRejectionTemplate(
          devItem.applicant.fullName,
          devItem.organizationName,
          devItem.applicationNo,
          publicRemarks?.trim() || "Application rejected upon review.",
          isPaid,
          refundId
        );

        await sendTransactionalEmail(
          devItem.applicant.email,
          `Update on Your Institute Affiliation Application — ${devItem.applicationNo}`,
          emailHtml
        );
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
      }

      return {
        success: true,
        message: `Application marked as REJECTED. ${refundMessage}`
      };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    await supabase.from("affiliations").update({
      current_status: "REJECTED",
      internal_remarks: internalRemarks.trim(),
      public_remarks: publicRemarks?.trim() || "Application was reviewed and rejected."
    }).eq("id", id);

    return { success: true, message: "Application marked as REJECTED." };
  } catch (err: any) {
    console.error("Error rejecting affiliation:", err);
    return { error: err.message || "Failed to reject application." };
  }
}

// ── Admin Retry Refund ────────────────────────────────────────────────────────
export async function adminRetryRefund(affiliationId: string) {
  try {
    const devItem = findDevAffiliationById(affiliationId);

    if (devItem && devItem.status === "APPROVED") {
      return { error: "Approved applications cannot be refunded." };
    }

    const { initiatePhonePeRefund } = await import("@/lib/payment/phonepe");
    const { AFFILIATION_FEE_AMOUNT } = await import("@/lib/affiliation-config");

    const origTxnId = devItem?.payment?.transactionId || affiliationId;
    const refundTxnId = `RF-RETRY-${Date.now()}`;

    const res = await initiatePhonePeRefund({
      originalTransactionId: origTxnId,
      refundTransactionId: refundTxnId,
      amount: devItem?.payment?.amount || AFFILIATION_FEE_AMOUNT
    });

    if (!res.success) {
      if (devItem && devItem.payment) {
        updateDevAffiliation(affiliationId, {
          payment: { ...devItem.payment, refundStatus: "REFUND_FAILED", failureReason: res.error }
        });
      }
      return { error: res.error || "Retry refund failed." };
    }

    if (devItem && devItem.payment) {
      updateDevAffiliation(affiliationId, {
        payment: {
          ...devItem.payment,
          status: "REFUND_INITIATED",
          refundId: res.refundId || refundTxnId,
          refundStatus: "REFUND_INITIATED",
          refundInitiatedAt: new Date().toLocaleDateString("en-IN")
        },
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: devItem.status,
            remarks: `Refund re-initiated manually by Admin (Ref ID: ${res.refundId || refundTxnId})`,
            date: new Date().toLocaleDateString("en-IN")
          }
        ]
      });
    }

    return { success: true, message: `Refund successfully re-initiated! Reference ID: ${res.refundId || refundTxnId}` };
  } catch (err: any) {
    return { error: err.message || "Failed to retry refund." };
  }
}

// ── Admin Check Refund Status ────────────────────────────────────────────────
export async function adminCheckRefundStatus(affiliationId: string) {
  try {
    const devItem = findDevAffiliationById(affiliationId);
    const refundId = devItem?.payment?.refundId || `RF-${devItem?.payment?.transactionId || affiliationId}`;

    const { checkPhonePeRefundStatus } = await import("@/lib/payment/phonepe");
    const statusRes = await checkPhonePeRefundStatus(refundId);

    if (statusRes.state === "REFUNDED" || statusRes.success) {
      const nowStr = new Date().toLocaleDateString("en-IN");
      if (devItem && devItem.payment) {
        updateDevAffiliation(affiliationId, {
          payment: {
            ...devItem.payment,
            status: "REFUNDED",
            refundStatus: "REFUNDED",
            refundedAt: nowStr
          },
          timeline: [
            ...devItem.timeline,
            {
              id: crypto.randomUUID(),
              fromStatus: devItem.status,
              toStatus: devItem.status,
              remarks: `Refund confirmed COMPLETED by PhonePe gateway.`,
              date: nowStr
            }
          ]
        });

        // Send Refund Completed Email
        try {
          const { getAffiliationRefundTemplate } = await import("@/services/email/templates");
          const { sendTransactionalEmail } = await import("@/services/email/service");

          const emailHtml = getAffiliationRefundTemplate(
            devItem.applicant.fullName,
            devItem.organizationName,
            devItem.applicationNo,
            refundId,
            devItem.payment.amount || 2100,
            nowStr
          );

          await sendTransactionalEmail(
            devItem.applicant.email,
            `Affiliation Fee Refund Completed — ${devItem.applicationNo}`,
            emailHtml
          );
        } catch (_) {}
      }

      return { success: true, status: "REFUNDED", message: "Refund confirmed completed by PhonePe!" };
    }

    return { success: true, status: statusRes.state, message: `Current refund status on PhonePe: ${statusRes.state}` };
  } catch (err: any) {
    return { error: err.message || "Failed to check refund status." };
  }
}

// ── Admin Retry Email ─────────────────────────────────────────────────────────
export async function adminRetryEmail(affiliationId: string, emailType: "RECEIPT" | "APPROVAL" | "REJECTION" | "REFUND", customPdfBase64?: string) {
  try {
    const devItem = findDevAffiliationById(affiliationId);
    if (!devItem) return { error: "Application not found." };

    const { sendTransactionalEmail } = await import("@/services/email/service");
    const { getAffiliationReceiptTemplate, getAffiliationApprovalTemplate, getAffiliationRejectionTemplate, getAffiliationRefundTemplate } = await import("@/services/email/templates");

    let subject = "";
    let htmlContent = "";
    let attachments: any[] | undefined = undefined;

    if (emailType === "RECEIPT") {
      subject = `Affiliation Application Payment Receipt — ${devItem.applicationNo}`;
      htmlContent = getAffiliationReceiptTemplate(
        devItem.applicant.fullName,
        devItem.organizationName,
        devItem.draftNo || devItem.applicationNo,
        devItem.applicationNo,
        devItem.payment?.amount || 2100,
        devItem.payment?.transactionId || "N/A",
        devItem.payment?.receiptNo || `DKFFJ/R/${new Date().getFullYear()}/000001`,
        devItem.payment?.paidAt || devItem.createdAt
      );

      try {
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
        const { AFFILIATION_FEE_DESCRIPTION, AFFILIATION_FEE_NOTE } = await import("@/lib/affiliation-config");
        const pdfBuf = await generateReceiptPdfBuffer({
          refId: devItem.applicationNo,
          receiptNo: devItem.payment?.receiptNo || `DKFFJ/R/${new Date().getFullYear()}/000001`,
          date: devItem.payment?.paidAt || devItem.createdAt,
          ackOrEnrollmentNo: devItem.applicationNo,
          gatewayTransactionId: devItem.payment?.gatewayTransactionId || devItem.payment?.transactionId || "N/A",
          amount: devItem.payment?.amount || 2100,
          description: AFFILIATION_FEE_DESCRIPTION,
          customerName: devItem.applicant.fullName,
          customerMobile: devItem.applicant.mobile,
          customerEmail: devItem.applicant.email,
          instituteName: devItem.organizationName,
          receiptType: "AFFILIATION",
          refundPolicyNote: AFFILIATION_FEE_NOTE
        });
        attachments = [{ filename: `Receipt_${devItem.applicationNo}.pdf`, content: pdfBuf }];
      } catch (_) {}
    } else if (emailType === "APPROVAL") {
      const affNo = devItem.affiliationNo || "DKFFJ/F/2026/0001";
      const validFromFormatted = devItem.validFrom ? new Date(devItem.validFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN");
      const validToFormatted = devItem.validTo ? new Date(devItem.validTo).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : new Date(Date.now() + 365 * 86400000).toLocaleDateString("en-IN");

      const { getNormalizedCourseCatalog } = await import("@/lib/courseCatalog");
      const { courseMap } = await getNormalizedCourseCatalog(false);

      const finalApprovedIds: string[] = devItem.approvedCourseIds || devItem.requestedCourseIds || [];
      const requestedIds: string[] = devItem.requestedCourseIds || [];

      const approvedCourses = finalApprovedIds.map((cid) => courseMap[cid]).filter(Boolean);
      const rejectedIds = requestedIds.filter((cid) => !finalApprovedIds.includes(cid));
      const rejectedCourses = rejectedIds.map((cid) => courseMap[cid]).filter(Boolean);

      subject = `Your DKFFJ Institute Affiliation Has Been Approved — ${affNo}`;
      htmlContent = getAffiliationApprovalTemplate(
        devItem.applicant.fullName,
        devItem.organizationName,
        devItem.applicationNo,
        affNo,
        validFromFormatted,
        validToFormatted,
        devItem.verificationToken,
        approvedCourses,
        rejectedCourses
      );

      attachments = [];
      try {
        let pdfBuf: Buffer;
        if (customPdfBase64) {
          pdfBuf = Buffer.from(customPdfBase64, "base64");
        } else {
          const { generateAffiliationCertificatePdfBuffer } = await import("@/lib/affiliationCertificatePdf");
          pdfBuf = await generateAffiliationCertificatePdfBuffer({
            id: devItem.id,
            applicationNo: devItem.applicationNo,
            affiliationNo: affNo,
            verificationToken: devItem.verificationToken || devItem.id,
            organizationName: devItem.organizationName,
            organizationType: devItem.organizationTypeOther || devItem.organizationType,
            registrationNumber: devItem.registrationNumber,
            establishmentYear: devItem.establishmentYear,
            district: devItem.district,
            state: devItem.state,
            address: devItem.address,
            validFromStr: validFromFormatted,
            validToStr: validToFormatted,
            applicantFullName: devItem.applicant.fullName,
            applicantDesignation: devItem.applicant.designation
          });
        }
        attachments.push({ filename: `Affiliation_Certificate_${affNo.replace(/\//g, "_")}.pdf`, content: pdfBuf });
      } catch (pdfErr) {
        console.error("Failed to generate PDF certificate for resend approval email:", pdfErr);
      }

      try {
        const { generateAffiliationAnnexurePdfBuffer } = await import("@/lib/affiliationAnnexurePdf");
        const annexureBuffer = await generateAffiliationAnnexurePdfBuffer({
          affiliationNo: affNo,
          organizationName: devItem.organizationName,
          district: devItem.district,
          state: devItem.state,
          validFrom: validFromFormatted,
          validTo: validToFormatted,
          approvedCourses
        });
        attachments.push({
          filename: `Annexure_A_Approved_Courses_${affNo.replace(/\//g, "_")}.pdf`,
          content: annexureBuffer
        });
      } catch (annexureErr) {
        console.error("Failed to generate Annexure-A PDF for resend approval email:", annexureErr);
      }
    } else if (emailType === "REJECTION") {
      subject = `Update on Your Institute Affiliation Application — ${devItem.applicationNo}`;
      htmlContent = getAffiliationRejectionTemplate(
        devItem.applicant.fullName,
        devItem.organizationName,
        devItem.applicationNo,
        devItem.publicRemarks || "Application reviewed and rejected.",
        !!devItem.payment?.refundStatus,
        devItem.payment?.refundId
      );
    } else if (emailType === "REFUND") {
      subject = `Affiliation Fee Refund Completed — ${devItem.applicationNo}`;
      htmlContent = getAffiliationRefundTemplate(
        devItem.applicant.fullName,
        devItem.organizationName,
        devItem.applicationNo,
        devItem.payment?.refundId || "RF-COMPLETED",
        devItem.payment?.amount || 2100,
        devItem.payment?.refundedAt || new Date().toLocaleDateString("en-IN")
      );
    }

    const emailRes = await sendTransactionalEmail(devItem.applicant.email, subject, htmlContent, attachments);

    // Log Email Attempt
    const existingAttempts = devItem.payment?.emailAttempts || [];
    const attemptNo = existingAttempts.length + 1;
    const attemptEntry = {
      attemptNo,
      type: emailType,
      sentAt: new Date().toLocaleString("en-IN"),
      success: !!emailRes.success,
      error: emailRes.error
    };

    if (devItem.payment) {
      updateDevAffiliation(affiliationId, {
        payment: {
          ...devItem.payment,
          emailAttempts: [...existingAttempts, attemptEntry]
        }
      });
    }

    if (!emailRes.success) {
      return { error: emailRes.error || "Email sending failed." };
    }

    return { success: true, message: `${emailType} email resent successfully to ${devItem.applicant.email} (Attempt #${attemptNo}).` };
  } catch (err: any) {
    return { error: err.message || "Failed to resend email." };
  }
}


export async function getSignedDocumentUrl(storagePath: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const targetBucket = storagePath.startsWith("photos/") ? "photos" : "documents";
    const cleanPath = storagePath.replace(/^(documents\/|photos\/|affiliation_documents\/)/, "");

    const { data, error } = await supabase.storage
      .from(targetBucket)
      .createSignedUrl(cleanPath, 60 * 15);

    if (error || !data?.signedUrl) {
      // Return public URL fallback
      const { data: pubData } = supabase.storage.from(targetBucket).getPublicUrl(cleanPath);
      return { url: pubData.publicUrl };
    }

    return { url: data.signedUrl };
  } catch (err: any) {
    return { error: err.message || "Failed to generate signed URL." };
  }
}

// ─── Admin Edit Application ───────────────────────────────────────────────────
import fs from "fs";
import path from "path";

export async function adminEditAffiliation(id: string, formData: FormData) {
  try {
    const devItem = findDevAffiliationById(id);

    // ── Parse Applicant Fields ──
    const fullName = (formData.get("fullName") as string || "").trim();
    const designation = (formData.get("designation") as string || "").trim();
    const mobile = (formData.get("mobile") as string || "").trim();
    const whatsapp = (formData.get("whatsapp") as string || mobile).trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const idProofType = (formData.get("idProofType") as string || "").trim();
    const idProofLastFour = (formData.get("idProofLastFour") as string || "").trim();
    const authorizedSignatoryName = (formData.get("authorizedSignatoryName") as string || "").trim();

    // ── Parse Institute Fields ──
    const organizationName = (formData.get("organizationName") as string || "").trim();
    const organizationType = (formData.get("organizationType") as string || "").trim();
    const organizationTypeOther = (formData.get("organizationTypeOther") as string || "").trim();
    const registrationNumber = (formData.get("registrationNumber") as string || "").trim();
    const panNumber = (formData.get("panNumber") as string || "").trim().toUpperCase();
    const establishmentYear = (formData.get("establishmentYear") as string || "").trim();
    const address = (formData.get("address") as string || "").trim();
    const state = (formData.get("state") as string || "").trim();
    const district = (formData.get("district") as string || "").trim();
    const pincode = (formData.get("pincode") as string || "").trim();
    const website = (formData.get("website") as string || "").trim();
    const studentCapacityStr = formData.get("studentCapacity") as string;
    const studentCapacity = studentCapacityStr ? parseInt(studentCapacityStr, 10) : null;

    const isDev = process.env.NODE_ENV === "development";
    const currentYear = new Date().getFullYear().toString();

    // ── Process Document Replacements ──
    const docKeys = [
      "PASSPORT_PHOTO", "REGISTRATION_CERTIFICATE", "PAN",
      "ID_PROOF", "BUILDING_INSIDE", "BUILDING_OUTSIDE", "LAB"
    ];

    const replacedDocs: { docType: string; fileName: string; fileSize: number; mimeType: string; storagePath: string; localUrl?: string }[] = [];

    for (const docType of docKeys) {
      const file = formData.get(`doc_${docType}`) as File | null;
      if (!file || file.size === 0) continue;

      if (file.size > 5 * 1024 * 1024) {
        return { error: `${docType} file exceeds 5 MB limit.` };
      }

      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${docType}_EDITED_${Date.now()}.${ext}`;
      const storagePath = `affiliations/${currentYear}/edited_${id}/${fileName}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let finalPath = storagePath;
      let localUrl: string | undefined;

      if (isDev) {
        try {
          const localDir = path.join(process.cwd(), "public", "dev-uploads", "affiliations", currentYear, `edited_${id}`);
          fs.mkdirSync(localDir, { recursive: true });
          fs.writeFileSync(path.join(localDir, fileName), buffer);
          localUrl = `/dev-uploads/affiliations/${currentYear}/edited_${id}/${fileName}`;
          finalPath = `local${localUrl}`;
        } catch (_) {}
      } else {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        try {
          const { error } = await supabase.storage.from("documents").upload(storagePath, buffer, { contentType: file.type, upsert: true });
          if (error) {
            await supabase.storage.from("photos").upload(storagePath, buffer, { contentType: file.type, upsert: true });
            finalPath = `photos/${storagePath}`;
          } else {
            finalPath = `documents/${storagePath}`;
          }
        } catch (_) {}
      }

      replacedDocs.push({
        docType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: finalPath,
        localUrl
      });
    }

    // ── Update Dev Store ──
    if (devItem) {
      // Merge updated documents (replace matching docType, keep others)
      let updatedDocs = [...devItem.documents];
      for (const rep of replacedDocs) {
        const idx = updatedDocs.findIndex((d) => d.documentType === rep.docType);
        const newDoc = {
          id: idx >= 0 ? updatedDocs[idx].id : crypto.randomUUID(),
          documentType: rep.docType,
          fileName: rep.fileName,
          fileSize: rep.fileSize,
          mimeType: rep.mimeType,
          storagePath: rep.storagePath,
          localUrl: rep.localUrl
        };
        if (idx >= 0) updatedDocs[idx] = newDoc;
        else updatedDocs.push(newDoc);
      }

      updateDevAffiliation(id, {
        organizationName: organizationName || devItem.organizationName,
        organizationType: organizationType || devItem.organizationType,
        organizationTypeOther: organizationTypeOther || devItem.organizationTypeOther,
        registrationNumber: registrationNumber || devItem.registrationNumber,
        panNumber: panNumber || devItem.panNumber,
        panMasked: panNumber ? maskPAN(panNumber) : devItem.panMasked,
        establishmentYear: establishmentYear || devItem.establishmentYear,
        address: address || devItem.address,
        state: state || devItem.state,
        district: district || devItem.district,
        pincode: pincode || devItem.pincode,
        website: website || devItem.website,
        studentCapacity: studentCapacity ?? devItem.studentCapacity,
        documents: updatedDocs,
        applicant: {
          ...devItem.applicant,
          fullName: fullName || devItem.applicant.fullName,
          designation: designation || devItem.applicant.designation,
          mobile: mobile || devItem.applicant.mobile,
          whatsapp: whatsapp || devItem.applicant.whatsapp,
          email: email || devItem.applicant.email,
          idProofType: idProofType || devItem.applicant.idProofType,
          idProofLastFour: idProofLastFour || devItem.applicant.idProofLastFour,
          idProofMasked: idProofLastFour ? maskIDProof(idProofLastFour) : devItem.applicant.idProofMasked,
          authorizedSignatoryName: authorizedSignatoryName || devItem.applicant.authorizedSignatoryName
        },
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: devItem.status,
            remarks: `Admin edited application. Fields updated: ${[
              fullName !== devItem.applicant.fullName ? "Name" : "",
              mobile !== devItem.applicant.mobile ? "Mobile" : "",
              email !== devItem.applicant.email ? "Email" : "",
              organizationName !== devItem.organizationName ? "Org Name" : "",
              address !== devItem.address ? "Address" : "",
              replacedDocs.length > 0 ? `Documents(${replacedDocs.map(d => d.docType).join(", ")})` : ""
            ].filter(Boolean).join(", ") || "Minor corrections"}`,
            date: new Date().toLocaleDateString("en-IN")
          }
        ]
      });

      return { success: true, message: "Application updated successfully by Admin." };
    }

    // ── Update Supabase (Production) ──
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      await supabase.from("affiliations").update({
        organization_name: organizationName || undefined,
        organization_type: organizationType || undefined,
        organization_type_other: organizationTypeOther || null,
        registration_number: registrationNumber || null,
        pan_number: panNumber || null,
        establishment_year: establishmentYear || undefined,
        address: address || undefined,
        state: state || undefined,
        district: district || undefined,
        pincode: pincode || undefined,
        website: website || null,
        student_capacity: studentCapacity
      }).eq("id", id);

      await supabase.from("affiliation_applicants").update({
        full_name: fullName || undefined,
        designation: designation || undefined,
        mobile: mobile || undefined,
        whatsapp: whatsapp || undefined,
        email: email || undefined,
        id_proof_type: idProofType || undefined,
        id_proof_last_four: idProofLastFour || undefined,
        authorized_signatory_name: authorizedSignatoryName || undefined
      }).eq("affiliation_id", id);
    } catch (_) {}

    return { success: true, message: "Application updated successfully by Admin." };
  } catch (err: any) {
    console.error("adminEditAffiliation error:", err);
    return { error: err.message || "Failed to update application." };
  }
}

export async function downloadAffiliationAnnexureAction(id: string) {
  try {
    const devItem = findDevAffiliationById(id);
    if (!devItem) return { error: "Affiliation record not found." };
    if (devItem.status !== "APPROVED") return { error: "Annexure-A is only available for APPROVED affiliations." };

    const { getNormalizedCourseCatalog } = await import("@/lib/courseCatalog");
    const { courseMap } = await getNormalizedCourseCatalog(false);

    const approvedIds = devItem.approvedCourseIds || devItem.requestedCourseIds || [];
    const approvedCourses = approvedIds
      .map(cid => courseMap[cid])
      .filter(Boolean);

    const { generateAffiliationAnnexurePdfBuffer } = await import("@/lib/affiliationAnnexurePdf");
    const pdfBuffer = await generateAffiliationAnnexurePdfBuffer({
      affiliationNo: devItem.affiliationNo || "PENDING",
      organizationName: devItem.organizationName,
      district: devItem.district,
      state: devItem.state,
      validFrom: devItem.validFrom || new Date().toLocaleDateString("en-IN"),
      validTo: devItem.validTo || new Date().toLocaleDateString("en-IN"),
      approvedCourses
    });

    return {
      success: true,
      pdfBase64: pdfBuffer.toString("base64"),
      fileName: `Annexure-A_${(devItem.affiliationNo || "CERT").replace(/\//g, "-")}.pdf`
    };
  } catch (err: any) {
    console.error("downloadAffiliationAnnexureAction error:", err);
    return { error: err.message || "Failed to generate Annexure-A PDF." };
  }
}

