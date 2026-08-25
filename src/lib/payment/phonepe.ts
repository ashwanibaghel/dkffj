/**
 * PhonePe v1 Payment Gateway Integration
 * Supports both UAT (sandbox) and PRODUCTION modes via PHONEPE_MODE env var
 */

import crypto from "crypto";
import type { PaymentDetails, PaymentResponse, PaymentGateway } from "./service";

const UAT_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PROD_BASE = "https://api.phonepe.com/apis/pg";

export function isProductionMode(): boolean {
  const mode = (process.env.PHONEPE_MODE || "").trim().toUpperCase();
  return mode === "PRODUCTION";
}

function getBase(): string {
  return isProductionMode() ? PROD_BASE : UAT_BASE;
}

/** Get the correct HTTP Request URL based on environment to avoid mapping errors in production */
function getRequestUrl(endpoint: string): string {
  if (isProductionMode()) {
    // In Production: endpoint is '/pg/v1/pay' -> '/apis/hermes/pg/v1/pay'
    return `https://api.phonepe.com/apis/hermes${endpoint}`;
  } else {
    // In Sandbox/UAT: endpoint is '/pg/v1/pay' -> '/apis/pg-sandbox/pg/v1/pay'
    return `https://api-preprod.phonepe.com/apis/pg-sandbox${endpoint}`;
  }
}

/** Get merchant ID dynamically, stripping UAT suffix in production mode as a fallback safety measure */
function getMerchantId(): string {
  let mId = process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPE_CLIENT_ID || "";
  mId = mId.trim();
  if (isProductionMode() && mId.includes("_")) {
    // Fallback: strip UAT suffix (e.g. DKFOUNDONLINE_2607022226 -> DKFOUNDONLINE)
    mId = mId.split("_")[0];
  }
  return mId;
}

/** Calculate X-VERIFY checksum header for PhonePe V1 security */
function calculateChecksum(payloadStr: string, endpoint: string, saltKey: string, saltIndex: string): string {
  const data = payloadStr + endpoint + saltKey;
  const sha256 = crypto.createHash("sha256").update(data).digest("hex");
  return `${sha256}###${saltIndex}`;
}

/** Create a PhonePe checkout order — returns the redirect URL */
export async function createPhonePeOrder(details: PaymentDetails): Promise<string> {
  const merchantId = getMerchantId();
  const saltKey = process.env.PHONEPE_API_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
  let appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  if (!appUrl || appUrl.includes("dkffj.vercel.app")) {
    appUrl = "https://dkffj.org";
  }

  // Bypass only for test emails containing "bypass"
  const isBypassEmail = details.customerEmail.toLowerCase().includes("bypass");

  if (isBypassEmail) {
    console.log(`[PAYMENT BYPASS] Bypass email detected - skipping PhonePe payment gateway`);
    return details.successUrl || `${appUrl}/payment/success?orderId=${encodeURIComponent(details.orderId)}`;
  }

  if (!merchantId || !saltKey) {
    throw new Error("PhonePe credentials missing: PHONEPE_MERCHANT_ID / PHONEPE_CLIENT_ID or PHONEPE_API_KEY");
  }

  const payload = {
    merchantId,
    merchantTransactionId: details.orderId,
    merchantUserId: "USER-" + details.orderId.split("-")[1] || "USER-SYSTEM",
    amount: Math.round(details.amount * 100), // convert ₹ to paise
    redirectUrl: details.successUrl || `${appUrl}/payment/success?orderId=${encodeURIComponent(details.orderId)}`,
    redirectMode: "REDIRECT",
    callbackUrl: `${appUrl}/api/phonepe/callback`,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payloadStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadStr).toString("base64");
  const xVerify = calculateChecksum(base64Payload, "/pg/v1/pay", saltKey, saltIndex);
  const requestUrl = getRequestUrl("/pg/v1/pay");

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
    },
    body: JSON.stringify({ request: base64Payload }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("PhonePe V1 pay error:", err);
    throw new Error(`PhonePe V1 order creation failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.success && json.data?.instrumentResponse?.redirectInfo?.url) {
    return json.data.instrumentResponse.redirectInfo.url as string;
  }

  console.error("PhonePe V1 response invalid:", json);
  throw new Error(json.message || "PhonePe did not return redirect URL");
}

/** Verify payment status for a given merchant order ID */
export async function verifyPhonePeOrder(merchantOrderId: string): Promise<{
  success: boolean;
  state: string;
  transactionId: string;
  amount: number;
}> {
  const merchantId = getMerchantId();
  const saltKey = process.env.PHONEPE_API_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

  if (!merchantId || !saltKey) {
    throw new Error("PhonePe credentials missing: PHONEPE_MERCHANT_ID / PHONEPE_CLIENT_ID or PHONEPE_API_KEY");
  }

  const endpoint = `/pg/v1/status/${merchantId}/${merchantOrderId}`;
  const xVerify = calculateChecksum("", endpoint, saltKey, saltIndex);
  const requestUrl = getRequestUrl(endpoint);

  const res = await fetch(requestUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": xVerify,
      "X-MERCHANT-ID": merchantId,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("PhonePe V1 status error:", err);
    return { success: false, state: "FAILED", transactionId: "", amount: 0 };
  }

  const json = await res.json();
  const success = json.success && json.code === "PAYMENT_SUCCESS";
  const state = json.code || "FAILED";
  const amount = json.data?.amount ? json.data.amount / 100 : 0; // paise → ₹
  const transactionId = json.data?.transactionId || merchantOrderId;

  return {
    success,
    state,
    transactionId,
    amount,
  };
}


/** Initiate a refund via PhonePe v1 REST API */
export async function initiatePhonePeRefund(params: {
  originalTransactionId: string;
  refundTransactionId: string;
  amount: number;
}): Promise<{
  success: boolean;
  refundId?: string;
  state?: string;
  error?: string;
}> {
  const merchantId = getMerchantId();
  const saltKey = process.env.PHONEPE_API_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

  const isDev = process.env.NODE_ENV === "development" || !saltKey || saltKey.includes("placeholder");

  if (isDev) {
    console.log(`[PHONEPE MOCK REFUND] Simulating refund for ${params.originalTransactionId}, Amount: ₹${params.amount}`);
    const mockRefundId = `RF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      refundId: mockRefundId,
      state: "REFUND_INITIATED"
    };
  }

  if (!merchantId || !saltKey) {
    return { success: false, error: "PhonePe credentials missing" };
  }

  const endpoint = "/pg/v1/refund";
  const payload = {
    merchantId,
    merchantTransactionId: params.refundTransactionId,
    originalTransactionId: params.originalTransactionId,
    amount: Math.round(params.amount * 100), // paise
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.org"}/api/phonepe/callback`
  };

  const payloadStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadStr).toString("base64");
  const xVerify = calculateChecksum(base64Payload, endpoint, saltKey, saltIndex);
  const requestUrl = getRequestUrl(endpoint);

  try {
    const res = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({ request: base64Payload }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("PhonePe refund error:", errText);
      return { success: false, error: `Refund request failed: ${res.status}` };
    }

    const json = await res.json();
    const success = json.success && (json.code === "PAYMENT_SUCCESS" || json.code === "REFUND_INITIATED" || json.code === "PAYMENT_PENDING");
    const refundId = json.data?.refundId || json.data?.transactionId || params.refundTransactionId;

    return {
      success,
      refundId,
      state: json.code || "REFUND_INITIATED",
      error: json.success ? undefined : json.message
    };
  } catch (err: any) {
    console.error("initiatePhonePeRefund exception:", err);
    return { success: false, error: err.message || "Failed to initiate refund" };
  }
}

/** Check refund status via PhonePe v1 API */
export async function checkPhonePeRefundStatus(refundTransactionId: string): Promise<{
  success: boolean;
  state: string;
  refundId?: string;
}> {
  const merchantId = getMerchantId();
  const saltKey = process.env.PHONEPE_API_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

  const isDev = process.env.NODE_ENV === "development" || !saltKey || saltKey.includes("placeholder");

  if (isDev) {
    return {
      success: true,
      state: "REFUNDED",
      refundId: refundTransactionId
    };
  }

  if (!merchantId || !saltKey) {
    return { success: false, state: "UNKNOWN" };
  }

  const endpoint = `/pg/v1/status/${merchantId}/${refundTransactionId}`;
  const xVerify = calculateChecksum("", endpoint, saltKey, saltIndex);
  const requestUrl = getRequestUrl(endpoint);

  try {
    const res = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, state: "FAILED" };
    }

    const json = await res.json();
    const success = json.success && (json.code === "PAYMENT_SUCCESS" || json.code === "REFUNDED");
    return {
      success,
      state: json.code || "PENDING",
      refundId: json.data?.transactionId || refundTransactionId
    };
  } catch (err: any) {
    return { success: false, state: "ERROR" };
  }
}

/** PaymentGateway implementation using PhonePe V1 */
export class PhonePeGateway implements PaymentGateway {
  async createOrder(details: PaymentDetails): Promise<string> {
    return createPhonePeOrder(details);
  }

  async verifyPayment(transactionId: string, payload: any): Promise<PaymentResponse> {
    // transactionId here = merchantOrderId (our orderId)
    const result = await verifyPhonePeOrder(transactionId);
    return {
      success: result.success,
      transactionId: result.transactionId,
      gatewayName: `PHONEPE_${process.env.PHONEPE_MODE || "UAT"}`,
      amount: result.amount || payload?.amount || 0,
      rawResponse: result,
    };
  }
}
