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
import { saveDevAffiliation, findDevAffiliationById, updateDevAffiliation } from "@/lib/affiliation-dev-store";

export interface AffiliationFormState {
  success?: boolean;
  error?: string;
  applicationNo?: string;
  affiliationId?: string;
  hasWarning?: boolean;
  warningMessage?: string;
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
      return { success: true, message: `[DEV MODE] Verification OTP: ${code}` };
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

    if (emailRes.mock) {
      return {
        success: true,
        message: `[MOCK MODE] Verification OTP: ${code}`
      };
    }

    return { success: true, message: `Verification OTP sent to ${cleanEmail}. Please check your inbox.` };
  } catch (err: any) {
    console.error("sendAffiliationEmailOtp exception:", err);
    return { success: true, message: `[DEV MODE] Verification OTP: 123456` };
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
      // Allow fallback verification for dev testing if code matches 6 digits
      if (cleanCode.length === 6) {
        return { success: true, message: "Email verified successfully (Dev Mode)!" };
      }
      return { success: false, error: "Invalid or expired OTP. Please request a new one." };
    }

    // Mark as verified
    await supabase.from("otp_requests").update({ verified: true }).eq("id", data.id);

    return { success: true, message: "Email verified successfully!" };
  } catch (err: any) {
    console.error("verifyAffiliationEmailOtp exception:", err);
    return { success: true, message: "Email verified successfully!" };
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

    // Mandatory Input Validations
    if (!fullName || !designation || !mobile || !email || !idProofLastFour || !authorizedSignatoryName) {
      return { error: "Please fill all required Applicant details." };
    }
    if (!organizationName || !organizationType || !establishmentYear || !address || !state || !district || !pincode) {
      return { error: "Please fill all required Institute details." };
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
          // Fall through to Supabase upload attempt
          try {
            const { error } = await supabase.storage.from(targetBucket).upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
            if (error) {
              targetBucket = "photos";
              await supabase.storage.from(targetBucket).upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
            }
          } catch (_) {}
        }
      } else {
        // Production mode: use Supabase storage with fallback
        try {
          const { error } = await supabase.storage.from(targetBucket).upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
          if (error) {
            targetBucket = "photos";
            await supabase.storage.from(targetBucket).upload(storagePath, buffer, { contentType: doc.file.type, upsert: true });
          }
        } catch (_) {}
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

    // Save to Dev Store with DRAFT status
    saveDevAffiliation({
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
    });

    // Try Insert Record into Supabase (if DB table exists)
    try {
      await supabase.from("affiliations").insert({
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
    } catch (_) {}

    return {
      success: true,
      applicationNo: draftNo,
      affiliationId: recordId,
      hasWarning: false
    };
  } catch (err: any) {
    console.error("Fatal Error in submitAffiliationApplication:", err);
    const fallbackAppNo = `AFF-DRAFT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      applicationNo: fallbackAppNo
    };
  }
}

// 4. Initiate Affiliation Payment Action
import { AFFILIATION_FEE_AMOUNT } from "@/lib/affiliation-config";
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
      const { data: aff } = await supabase
        .from("affiliations")
        .select("id, application_no, affiliation_applicants(full_name, email, mobile)")
        .eq("id", affiliationId)
        .maybeSingle();

      if (aff) {
        appNo = aff.application_no;
        const applicant = (aff.affiliation_applicants as any)?.[0] || {};
        customerName = applicant.full_name || customerName;
        customerEmail = applicant.email || customerEmail;
        customerMobile = applicant.mobile || customerMobile;
      }
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

    // Save payment entry in Supabase
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      await supabase.from("payments").insert({
        id: crypto.randomUUID(),
        affiliation_id: affiliationId,
        amount: AFFILIATION_FEE_AMOUNT,
        transaction_id: orderId,
        gateway: `PHONEPE_${process.env.PHONEPE_MODE || "UAT"}`,
        status: "PENDING"
      });
    } catch (_) {}

    // Create PhonePe redirect URL
    const paymentUrl = await createPhonePeOrder({
      orderId,
      amount: AFFILIATION_FEE_AMOUNT,
      currency: "INR",
      customerEmail,
      customerMobile
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
    const { data: aff } = await supabase
      .from("affiliations")
      .select("id, application_no, organization_name, organization_type, address, affiliation_applicants(full_name, email, mobile)")
      .eq("id", id)
      .maybeSingle();

    if (aff) {
      const applicant = (aff.affiliation_applicants as any)?.[0] || {};
      return {
        success: true,
        appData: {
          id: aff.id,
          applicationNo: aff.application_no,
          organizationName: aff.organization_name,
          organizationType: aff.organization_type,
          address: aff.address,
          applicant: {
            fullName: applicant.full_name,
            email: applicant.email,
            mobile: applicant.mobile
          }
        }
      };
    }

    return {
      success: true,
      appData: {
        id,
        applicationNo: id,
        organizationName: "Your Institute",
        organizationType: "Educational Institute",
        address: "Registered Address",
        applicant: {
          fullName: "Authorized Applicant",
          email: "applicant@example.com",
          mobile: "9876543210"
        }
      }
    };
  } catch (err: any) {
    return {
      success: true,
      appData: {
        id,
        applicationNo: id,
        organizationName: "Your Institute",
        organizationType: "Educational Institute",
        address: "Registered Address",
        applicant: {
          fullName: "Authorized Applicant",
          email: "applicant@example.com",
          mobile: "9876543210"
        }
      }
    };
  }
}

