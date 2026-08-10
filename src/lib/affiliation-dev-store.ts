import fs from "fs";
import path from "path";

export interface DevAffiliationRecord {
  id: string;
  applicationNo: string; // Can be AFF-DRAFT-2026-XXXXXX initially, then AFF-2026-XXXXXX after payment
  draftNo?: string;
  affiliationNo?: string | null;
  certificateVersion?: number; // 1, 2, etc.
  verificationToken: string;
  slug: string;
  organizationName: string;
  organizationType: string;
  organizationTypeOther?: string | null;
  registrationNumber?: string | null;
  panNumber?: string | null;
  panMasked: string;
  establishmentYear: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  website?: string | null;
  studentCapacity?: number | null;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "INSPECTION_PENDING" | "APPROVED" | "REJECTED";
  hasDuplicateWarning: boolean;
  warningDetails?: string | null;
  requestedCourseIds?: string[];
  approvedCourseIds?: string[];
  validFrom?: string | null;
  validTo?: string | null;
  renewalDueOn?: string | null;
  renewalNoticeSent?: boolean;
  expiredAt?: string | null;
  internalRemarks?: string | null;
  publicRemarks?: string | null;
  createdAt: string;
  payment?: {
    transactionId: string;           // merchantOrderId (our ID)
    gatewayTransactionId?: string;   // PhonePe's transactionId
    receiptNo?: string;              // e.g. DKFFJ/R/2026/000001
    amount: number;                  // 2100
    currency: string;                // "INR"
    status: "CREATED" | "PENDING" | "COMPLETED" | "FAILED" |
            "REFUND_INITIATED" | "REFUND_PENDING" | "REFUNDED" | "REFUND_FAILED";
    refundId?: string | null;
    refundStatus?: "REFUND_INITIATED" | "REFUND_PENDING" | "REFUNDED" | "REFUND_FAILED" | null;
    refundAmount?: number | null;
    paidAt?: string | null;
    paidAtIST?: string | null;
    refundInitiatedAt?: string | null;
    refundedAt?: string | null;
    failureReason?: string | null;
    emailAttempts?: {
      attemptNo: number;
      type: "RECEIPT" | "APPROVAL" | "REJECTION" | "REFUND";
      sentAt: string;
      success: boolean;
      error?: string | null;
    }[];
  };
  applicant: {
    id: string;
    fullName: string;
    designation: string;
    mobile: string;
    whatsapp: string;
    email: string;
    idProofType: string;
    idProofLastFour: string;
    idProofMasked: string;
    authorizedSignatoryName: string;
    declarationAcceptedAt: string;
    declarationIpAddress: string;
  };
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    localUrl?: string;
  }[];
  domains: {
    id: string;
    domainType: string;
    domainOther?: string | null;
  }[];
  infrastructure: {
    id: string;
    infraType: string;
  }[];
  timeline: {
    id: string;
    fromStatus: string;
    toStatus: string;
    remarks: string;
    date: string;
  }[];
}

const DEV_DATA_FILE = path.join(process.cwd(), "scratch", "affiliation_dev_store.json");

function ensureDevFileExists() {
  try {
    const dir = path.dirname(DEV_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DEV_DATA_FILE)) {
      fs.writeFileSync(DEV_DATA_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error in ensureDevFileExists:", err);
  }
}

export function getDevAffiliations(): DevAffiliationRecord[] {
  try {
    ensureDevFileExists();
    if (fs.existsSync(DEV_DATA_FILE)) {
      const content = fs.readFileSync(DEV_DATA_FILE, "utf-8");
      return JSON.parse(content || "[]");
    }
  } catch (err) {
    console.error("Error reading dev affiliation file:", err);
  }
  return [];
}

export function saveDevAffiliation(record: DevAffiliationRecord) {
  try {
    ensureDevFileExists();
    const list = getDevAffiliations();
    // Remove duplicate if exists by applicationNo or id
    const filtered = list.filter((item) => item.id !== record.id && item.applicationNo !== record.applicationNo);
    filtered.unshift(record);
    fs.writeFileSync(DEV_DATA_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving dev affiliation record:", err);
  }
}

export function findDevAffiliationById(id: string): DevAffiliationRecord | undefined {
  const list = getDevAffiliations();
  return list.find((item) => item.id === id || item.applicationNo === id);
}

export function findDevAffiliationByAppNo(appNo: string): DevAffiliationRecord | undefined {
  const clean = appNo.trim().toLowerCase();
  const list = getDevAffiliations();
  return list.find(
    (item) =>
      item.applicationNo.toLowerCase() === clean ||
      (item.affiliationNo && item.affiliationNo.toLowerCase() === clean)
  );
}

export function updateDevAffiliation(id: string, updates: Partial<DevAffiliationRecord>) {
  try {
    ensureDevFileExists();
    const list = getDevAffiliations();
    const item = list.find((d) => d.id === id || d.applicationNo === id);
    if (item) {
      Object.assign(item, updates);
      fs.writeFileSync(DEV_DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error updating dev affiliation record:", err);
  }
}
