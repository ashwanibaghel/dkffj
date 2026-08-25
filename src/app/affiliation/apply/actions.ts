"use server";

import fs from "fs";
import path from "path";

import { cookies, headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getMembershipVerificationTemplate } from "@/services/email/templates";
import {
  generateVerificationToken,
  generateInstituteSlug,
  maskPAN,
  maskIDProof
} from "@/lib/affiliation-utils";
import { saveDevAffiliation, findDevAffiliationById, updateDevAffiliation, getDevAffiliations, type DevAffiliationRecord } from "@/lib/affiliation-dev-store";
import { AFFILIATION_FEE_AMOUNT, AFFILIATION_FEE_DESCRIPTION, AFFILIATION_FEE_NOTE } from "@/lib/affiliation-config";

import { getNormalizedCourseCatalog } from "@/lib/courseCatalog";

export interface AffiliationFormState {
  success?: boolean;
  error?: string;
  applicationNo?: string;
  affiliationId?: string;
  hasWarning?: boolean;
  warningMessage?: string;
}

export async function fetchNormalizedCoursesAction() {
  return await getNormalizedCourseCatalog(true);
}

// 1. Send Email Verification OTP
export async function sendAffiliationEmailOtp(email: string) {
  try {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid Email address." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins expiry

    // Save to otp_requests table
    const { error: dbErr } = await supabase
      .from("otp_requests")
      .insert({
        email: cleanEmail,
        mobile: "N/A",
        otp_code: code,
        expires_at: expiresAt,
        verified: false
      });

    if (dbErr) {
      console.error("DB error saving OTP request:", dbErr);
      return { success: false, error: "Unable to start verification. Please try again." };
    }

    // Send Email
    const subject = "Email Verification OTP — DKFFJ Institute Affiliation";
    const htmlContent = getMembershipVerificationTemplate(code);
    const emailRes = await sendTransactionalEmail(cleanEmail, subject, htmlContent);

    if (!emailRes.success) {
      console.error("Email send failed:", emailRes.error);
      return { success: false, error: "Email bhejne mein samasya aai. Kuch der baad dobara koshish karein." };
    }

    console.log(`[AFFILIATION OTP SENT] To Email: ${cleanEmail} -> CODE: ${code}`);

    return { success: true, message: `Verification OTP sent to ${cleanEmail}. Please check your inbox.` };
  } catch (err: any) {
    console.error("sendAffiliationEmailOtp exception:", err);
    return { success: false, error: "Unable to start verification. Please try again." };
  }
}

// 2. Verify Email OTP
export async function verifyAffiliationEmailOtp(email: string, code: string) {
  try {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (code || "").trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, error: "Email address and OTP code are required." };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("otp_requests")
      .select("id, otp_code, expires_at, verified")
      .eq("email", cleanEmail)
      .eq("otp_code", cleanCode)
      .eq("verified", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "Invalid or expired OTP. Please request a new one." };
    }

    // Mark as verified
    await supabase.from("otp_requests").update({ verified: true }).eq("id", data.id);

    return { success: true, message: "Email verified successfully!" };
  } catch (err: any) {
    console.error("verifyAffiliationEmailOtp exception:", err);
    return { success: false, error: "Verification failed. Please try again." };
  }
}

// 3. Submit Form Action
export async function submitAffiliationApplication(formData: FormData): Promise<AffiliationFormState> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Extract Applicant Details
    const fullName = (formData.get("fullName") as string || "").trim();
    const designation = (formData.get("designation") as string || "").trim();
    const mobile = (formData.get("mobile") as string || "").trim();
    const whatsapp = (formData.get("whatsapp") as string || mobile).trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const idProofType = (formData.get("idProofType") as string || "Aadhaar").trim();
    const idProofLastFour = (formData.get("idProofLastFour") as string || "").trim();
    const authorizedSignatoryName = (formData.get("authorizedSignatoryName") as string || "").trim();

    // Extract Institute Details
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

    // Extract Arrays
    const domainsRaw = formData.getAll("domains") as string[];
    const domainOther = (formData.get("domainOther") as string || "").trim();
    const infrastructureRaw = formData.getAll("infrastructure") as string[];
    const requestedCourseIds = formData.getAll("requestedCourseIds") as string[];

    // Mandatory Input Validations
    if (!fullName || !designation || !mobile || !email || !idProofLastFour || !authorizedSignatoryName) {
      return { error: "Please fill all required Applicant details." };
    }
    if (!organizationName || !organizationType || !establishmentYear || !address || !state || !district || !pincode) {
      return { error: "Please fill all required Institute details." };
    }

    // Require a fresh, verified email OTP. Keep it valid until all validation,
    // uploads and persistence have succeeded; consuming it earlier stranded
    // applicants after a transient upload/database error.
    const { data: verifiedOtp, error: otpError } = await supabase
      .from("otp_requests")
      .select("id")
      .eq("email", email)
      .eq("mobile", "N/A")
      .eq("verified", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (otpError || !verifiedOtp) {
      return { error: "Please verify your email with a current OTP before submitting." };
    }
    // Document File Handling
    const documentFiles: { type: string; file: File }[] = [];
    const docKeys: { formKey: string; docType: string; label: string; required: boolean }[] = [
      { formKey: "passportPhoto", docType: "PASSPORT_PHOTO", label: "Passport Photo", required: true },
      { formKey: "registrationCertificate", docType: "REGISTRATION_CERTIFICATE", label: "Registration Certificate", required: false },
      { formKey: "panCard", docType: "PAN", label: "PAN Card", required: false },
      { formKey: "idProofDoc", docType: "ID_PROOF", label: "ID Proof Document", required: true },
      { formKey: "buildingInsidePhoto", docType: "BUILDING_INSIDE", label: "Building Photo (Inside)", required: true },
      { formKey: "buildingOutsidePhoto", docType: "BUILDING_OUTSIDE", label: "Building Photo (Outside)", required: true },
      { formKey: "labPhoto", docType: "LAB", label: "Lab Photo", required: false }
    ];

    for (const key of docKeys) {
      const file = formData.get(key.formKey) as File | null;
      if (key.required && (!file || file.size === 0)) {
        return { error: `Please upload ${key.label}.` };
      }
      if (file && file.size > 0) {
        if (file.size > 5 * 1024 * 1024) {
          return { error: `${key.label} exceeds 5 MB limit. Please upload a file smaller than 5 MB.` };
        }
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
          return { error: `${key.label} must be an image or PDF file.` };
        }
        documentFiles.push({ type: key.docType, file });
      }
    }

    // Attempt Storage Upload
    const currentYear = new Date().getFullYear().toString();
    const uploadSessionId = crypto.randomUUID();
    const uploadedMetadata: { type: string; name: string; size: number; mime: string; path: string; localUrl?: string }[] = [];

    // Check if running in dev/localhost mode
    const isDev = process.env.NODE_ENV === "development";

    for (const doc of documentFiles) {
      const ext = doc.file.name.split(".").pop() || "bin";
      const fileName = `${doc.type}_${Date.now()}.${ext}`;
      const storagePath = `affiliations/${currentYear}/${uploadSessionId}/${fileName}`;

      const arrayBuffer = await doc.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let targetBucket = "documents";
      let localUrl: string | undefined;

      if (isDev) {
        // In dev mode: save file locally to public/dev-uploads for viewability
        try {
          const localDir = path.join(process.cwd(), "public", "dev-uploads", "affiliations", currentYear, uploadSessionId);
          fs.mkdirSync(localDir, { recursive: true });
          const localFilePath = path.join(localDir, fileName);
          fs.writeFileSync(localFilePath, buffer);
          localUrl = `/dev-uploads/affiliations/${currentYear}/${uploadSessionId}/${fileName}`;
          targetBucket = "local";
          console.log(`[DEV] Saved document locally: ${localFilePath}`);
        } catch (localErr) {
          console.error("[DEV] Local file save failed:", localErr);
          const { error: documentUploadError } = await supabase.storage
            .from(targetBucket)
            .upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
          if (documentUploadError) {
            targetBucket = "photos";
            const { error: photoUploadError } = await supabase.storage
              .from(targetBucket)
              .upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
            if (photoUploadError) {
              return { error: `Unable to upload ${doc.file.name}. Please try again.` };
            }
          }
        }
      } else {
        // Production mode: storage failure must stop the submission. Silently
        // continuing here created broken drafts that could not be reviewed.
        const { error: documentUploadError } = await supabase.storage
          .from(targetBucket)
          .upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
        if (documentUploadError) {
          targetBucket = "photos";
          const { error: photoUploadError } = await supabase.storage
            .from(targetBucket)
            .upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
          if (photoUploadError) {
            console.error("Affiliation document upload failed:", photoUploadError);
            return { error: `Unable to upload ${doc.file.name}. Please try again.` };
          }
        }
      }

      uploadedMetadata.push({
        type: doc.type,
        name: doc.file.name,
        size: doc.file.size,
        mime: doc.file.type,
        path: localUrl ? `local${localUrl}` : `${targetBucket}/${storagePath}`,
        localUrl
      });
    }

    // Draft Tracking Number Generation
    const draftSeq = Math.floor(100000 + Math.random() * 900000);
    const draftNo = `AFF-DRAFT-${currentYear}-${draftSeq}`;
    const verificationToken = generateVerificationToken();
    const slug = generateInstituteSlug(organizationName, district);
    const recordId = crypto.randomUUID();

    const headersList = await headers();
    const clientIp = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const draftRecord: DevAffiliationRecord = {
      id: recordId,
      applicationNo: draftNo,
      draftNo,
      verificationToken,
      slug,
      organizationName,
      organizationType,
      organizationTypeOther,
      registrationNumber,
      panNumber,
      panMasked: maskPAN(panNumber),
      establishmentYear,
      address,
      state,
      district,
      pincode,
      website,
      studentCapacity,
      requestedCourseIds,
      status: "DRAFT",
      hasDuplicateWarning: false,
      publicRemarks: "Draft created. Awaiting processing fee payment.",
      createdAt: new Date().toLocaleDateString("en-IN"),
      payment: {
        transactionId: `AFFPAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: 2100,
        currency: "INR",
        status: "CREATED"
      },
      applicant: {
        id: crypto.randomUUID(),
        fullName,
        designation,
        mobile,
        whatsapp: whatsapp || mobile,
        email,
        idProofType,
        idProofLastFour,
        idProofMasked: maskIDProof(idProofLastFour),
        authorizedSignatoryName,
        declarationAcceptedAt: new Date().toLocaleDateString("en-IN"),
        declarationIpAddress: clientIp
      },
      documents: uploadedMetadata.map((meta) => ({
        id: crypto.randomUUID(),
        documentType: meta.type,
        fileName: meta.name,
        fileSize: meta.size,
        mimeType: meta.mime,
        storagePath: meta.path,
        localUrl: meta.localUrl
      })),
      domains: domainsRaw.map((d) => ({
        id: crypto.randomUUID(),
        domainType: d,
        domainOther: d === "OTHER" ? domainOther : null
      })),
      infrastructure: infrastructureRaw.map((i) => ({
        id: crypto.randomUUID(),
        infraType: i
      })),
      timeline: [
        {
          id: crypto.randomUUID(),
          fromStatus: "NONE",
          toStatus: "DRAFT",
          remarks: `Draft application created by ${fullName} (${email}). IP: ${clientIp}`,
          date: new Date().toLocaleDateString("en-IN")
        }
      ]
    };

    // Local dev uses the filesystem-backed store. Production must use the
    // database; Vercel/serverless instances do not retain this local state.
    if (!isDev) {
      const { error: affiliationInsertError } = await supabase.from("affiliations").insert({
        id: recordId,
        application_no: draftNo,
        draft_no: draftNo,
        verification_token: verificationToken,
        slug,
        organization_name: organizationName,
        organization_type: organizationType,
        organization_type_other: organizationTypeOther || null,
        registration_number: registrationNumber || null,
        pan_number: panNumber || null,
        establishment_year: establishmentYear,
        address,
        state,
        district,
        pincode,
        website: website || null,
        student_capacity: studentCapacity,
        current_status: "DRAFT",
        has_duplicate_warning: false,
        public_remarks: "Draft created. Awaiting processing fee payment."
      });

      if (affiliationInsertError) {
        console.error("Affiliation draft insert failed:", affiliationInsertError);
        return { error: "Unable to save your application. Please try again; no payment has been started." };
      }

      const { error: applicantInsertError } = await supabase.from("affiliation_applicants").insert({
        affiliation_id: recordId,
        full_name: fullName,
        designation,
        mobile,
        whatsapp: whatsapp || mobile,
        email,
        id_proof_type: idProofType,
        id_proof_last_four: idProofLastFour,
        authorized_signatory_name: authorizedSignatoryName,
        declaration_accepted: true,
        declaration_ip_address: clientIp
      });

      let persistenceError: unknown = applicantInsertError;
      if (!persistenceError && uploadedMetadata.length > 0) {
        const { error } = await supabase.from("affiliation_documents").insert(uploadedMetadata.map((meta) => ({
          affiliation_id: recordId, document_type: meta.type, file_name: meta.name,
          file_size: meta.size, mime_type: meta.mime, storage_path: meta.path
        })));
        persistenceError = error;
      }
      if (!persistenceError && domainsRaw.length > 0) {
        const { error } = await supabase.from("affiliation_domains").insert(domainsRaw.map((domain) => ({
          affiliation_id: recordId, domain_type: domain, domain_other: domain === "OTHER" ? domainOther || null : null
        })));
        persistenceError = error;
      }
      if (!persistenceError && infrastructureRaw.length > 0) {
        const { error } = await supabase.from("affiliation_infrastructure").insert(infrastructureRaw.map((infra) => ({
          affiliation_id: recordId, infra_type: infra
        })));
        persistenceError = error;
      }
      if (persistenceError) {
        console.error("Affiliation detail insert failed:", persistenceError);
        await supabase.from("affiliations").delete().eq("id", recordId);
        return { error: "Unable to save all application details. Please try again; no payment has been started." };
      }
    }

    // Consume the OTP only after the complete draft is safely available for
    // checkout. The conditional update prevents a double submit from using it.
    const { data: consumedOtp, error: consumeOtpError } = await supabase
      .from("otp_requests")
      .update({ verified: false })
      .eq("id", verifiedOtp.id)
      .eq("verified", true)
      .select("id");
    if (consumeOtpError || !consumedOtp || consumedOtp.length !== 1) {
      if (!isDev) await supabase.from("affiliations").delete().eq("id", recordId);
      return { error: "OTP has already been used. Please request a new OTP." };
    }
    if (isDev) {
      saveDevAffiliation(draftRecord);
    }

    return {
      success: true,
      applicationNo: draftNo,
      affiliationId: recordId,
      hasWarning: false
    };
  } catch (err: any) {
    console.error("Fatal Error in submitAffiliationApplication:", err);
    return { error: "Unable to save your application. Please try again; no payment has been started." };
  }
}

// 4. Initiate Affiliation Payment Action
import { createPhonePeOrder } from "@/lib/payment/phonepe";

export async function initiateAffiliationPayment(affiliationId: string) {
  try {
    const devItem = findDevAffiliationById(affiliationId);

    let customerName = "Applicant";
    let customerEmail = "applicant@example.com";
    let customerMobile = "";
    let appNo = affiliationId;

    if (devItem) {
      customerName = devItem.applicant.fullName;
      customerEmail = devItem.applicant.email;
      customerMobile = devItem.applicant.mobile;
      appNo = devItem.applicationNo;
    } else {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data: aff, error: affiliationError } = await supabase
        .from("affiliations")
        .select("id, application_no, current_status, affiliation_applicants(full_name, email, mobile)")
        .eq("id", affiliationId)
        .maybeSingle();

      if (affiliationError || !aff) {
        return { error: "Application draft was not found. Please return to the form and submit it again." };
      }
      if (aff.current_status !== "DRAFT") {
        return { error: "This application is no longer awaiting payment. Please use the tracking page." };
      }

      appNo = aff.application_no;
      const applicant = (aff.affiliation_applicants as any)?.[0] || {};
      if (!applicant.full_name || !applicant.email || !applicant.mobile) {
        return { error: "Application contact details are incomplete. Please return to the form and submit it again." };
      }
      customerName = applicant.full_name;
      customerEmail = applicant.email;
      customerMobile = applicant.mobile;
    }

    const orderId = `AFFPAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update dev store payment record
    if (devItem) {
      updateDevAffiliation(affiliationId, {
        payment: {
          transactionId: orderId,
          amount: AFFILIATION_FEE_AMOUNT,
          currency: "INR",
          status: "PENDING"
        },
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: devItem.status,
            remarks: `PhonePe payment initiated (Order ID: ${orderId}, Amount: ₹${AFFILIATION_FEE_AMOUNT})`,
            date: new Date().toLocaleDateString("en-IN")
          }
        ]
      });
    }

    // The payment record must exist before PhonePe is called; otherwise a paid
    // transaction could not be verified or recovered by the callback.
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { error: paymentInsertError } = await supabase.from("payments").insert({
        id: crypto.randomUUID(),
        affiliation_id: affiliationId,
        amount: AFFILIATION_FEE_AMOUNT,
        transaction_id: orderId,
        gateway: `PHONEPE_${process.env.PHONEPE_MODE || "UAT"}`,
        status: "PENDING"
      });
      if (paymentInsertError) {
        console.error("Affiliation payment record insert failed:", paymentInsertError);
        return { error: "Unable to start secure payment. Please try again; no payment has been started." };
      }
    } catch (error) {
      console.error("Affiliation payment record creation failed:", error);
      return { error: "Unable to start secure payment. Please try again; no payment has been started." };
    }

    // Create PhonePe redirect URL
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.org").replace(/\/$/, "");
    const paymentUrl = await createPhonePeOrder({
      orderId,
      amount: AFFILIATION_FEE_AMOUNT,
      currency: "INR",
      customerEmail,
      customerMobile,
      successUrl: `${baseUrl}/affiliation/success?orderId=${encodeURIComponent(orderId)}`
    });

    return {
      success: true,
      orderId,
      paymentUrl
    };
  } catch (err: any) {
    console.error("initiateAffiliationPayment error:", err);
    return {
      error: err.message || "Failed to initiate payment. Please try again."
    };
  }
}

export async function getAffiliationPaymentDetails(id: string) {
  try {
    const item = findDevAffiliationById(id);
    if (item) {
      return { success: true, appData: item };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: aff, error: affiliationError } = await supabase
      .from("affiliations")
      .select("id, application_no, organization_name, organization_type, address, current_status, affiliation_applicants(full_name, email, mobile)")
      .eq("id", id)
      .maybeSingle();

    if (aff && !affiliationError) {
      const applicant = (aff.affiliation_applicants as any)?.[0] || {};
      if (!applicant.full_name || !applicant.email || !applicant.mobile) {
        return { error: "Application details are incomplete. Please return to the form and submit it again." };
      }
      return {
        success: true,
        appData: {
          id: aff.id,
          applicationNo: aff.application_no,
          organizationName: aff.organization_name,
          organizationType: aff.organization_type,
          address: aff.address,
          status: aff.current_status,
          applicant: {
            fullName: applicant.full_name,
            email: applicant.email,
            mobile: applicant.mobile
          }
        }
      };
    }

    return { error: "Application draft was not found. Please return to the form and submit it again." };
  } catch (err: any) {
    console.error("getAffiliationPaymentDetails error:", err);
    return { error: "Unable to load your application. Please try again." };
  }
}

export async function bypassAffiliationPayment(affiliationId: string) {
  if (process.env.NODE_ENV !== "development") {
    return { error: "Test payment bypass is disabled." };
  }
  try {
    const devItem = findDevAffiliationById(affiliationId);
    if (devItem) {
      const year = new Date().getFullYear();
      let officialNo = devItem.applicationNo;
      if (officialNo.startsWith("AFF-DRAFT-")) {
        const devList = getDevAffiliations();
        const nonDraftCount = devList.filter((d: any) => !d.applicationNo.startsWith("AFF-DRAFT-")).length;
        const seq = String(nonDraftCount + 1).padStart(6, "0");
        officialNo = `AFF-${year}-${seq}`;
      }

      const orderId = devItem.payment?.transactionId || `AFFPAY-${Date.now()}-TEST`;
      const paidAtStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const receiptNo = `DKFFJ/R/${year}/0000${Math.floor(100 + Math.random() * 900)}`;

      updateDevAffiliation(affiliationId, {
        applicationNo: officialNo,
        draftNo: devItem.applicationNo,
        status: "SUBMITTED",
        payment: {
          transactionId: orderId,
          gatewayTransactionId: `MOCK_TXN_${Date.now()}`,
          amount: AFFILIATION_FEE_AMOUNT,
          currency: "INR",
          status: "COMPLETED",
          paidAt: paidAtStr,
          receiptNo
        },
        timeline: [
          ...devItem.timeline,
          {
            id: crypto.randomUUID(),
            fromStatus: devItem.status,
            toStatus: "SUBMITTED",
            remarks: `Payment verified via test bypass mode. Official Application No assigned: ${officialNo}`,
            date: paidAtStr
          }
        ]
      });

      // A local test must not accidentally send a real receipt email.  Set this
      // explicitly only when email delivery itself is being tested.
      if (process.env.ENABLE_DEV_EMAILS === "true") try {
        const { getAffiliationReceiptTemplate } = await import("@/services/email/templates");
        const { sendTransactionalEmail } = await import("@/services/email/service");
        const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");

        const emailHtml = getAffiliationReceiptTemplate(
          devItem.applicant.fullName,
          devItem.organizationName,
          devItem.applicationNo,
          officialNo,
          AFFILIATION_FEE_AMOUNT,
          orderId,
          receiptNo,
          paidAtStr
        );

        let attachments: any[] = [];
        try {
          const pdfBuf = await generateReceiptPdfBuffer({
            refId: officialNo,
            receiptNo,
            date: paidAtStr,
            ackOrEnrollmentNo: officialNo,
            gatewayTransactionId: `MOCK_TXN_${Date.now()}`,
            amount: AFFILIATION_FEE_AMOUNT,
            description: AFFILIATION_FEE_DESCRIPTION,
            customerName: devItem.applicant.fullName,
            customerMobile: devItem.applicant.mobile,
            customerEmail: devItem.applicant.email,
            instituteName: devItem.organizationName,
            receiptType: "AFFILIATION",
            refundPolicyNote: AFFILIATION_FEE_NOTE
          });
          attachments = [{ filename: `Receipt_${officialNo}.pdf`, content: pdfBuf }];
        } catch (_) {}

        await sendTransactionalEmail(
          devItem.applicant.email,
          `Affiliation Application Payment Receipt — ${officialNo}`,
          emailHtml,
          attachments
        );
      } catch (emailErr) {
        console.error("Bypass email error:", emailErr);
      }

      return { success: true, applicationNo: officialNo, orderId };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: aff } = await supabase
      .from("affiliations")
      .select("id, application_no, organization_name, affiliation_applicants(full_name, email, mobile)")
      .eq("id", affiliationId)
      .maybeSingle();

    if (aff) {
      let officialNo = aff.application_no;
      if (officialNo.startsWith("AFF-DRAFT-")) {
        const { data: nextNo } = await supabase.rpc("generate_next_number", {
          p_key: "affiliation_app",
          p_prefix: `AFF-${new Date().getFullYear()}-`
        });
        if (nextNo) officialNo = nextNo;
      }

      const orderId = `AFFPAY-${Date.now()}-TEST`;
      await supabase.from("payments").insert({
        id: crypto.randomUUID(),
        affiliation_id: affiliationId,
        amount: AFFILIATION_FEE_AMOUNT,
        transaction_id: orderId,
        gateway: "TEST_BYPASS",
        status: "COMPLETED"
      });

      await supabase.from("affiliations").update({
        application_no: officialNo,
        current_status: "SUBMITTED"
      }).eq("id", affiliationId);

      return { success: true, applicationNo: officialNo, orderId };
    }

    return { error: "Application record not found for test bypass." };
  } catch (err: any) {
    return { error: err.message || "Failed to process test payment bypass." };
  }
}
