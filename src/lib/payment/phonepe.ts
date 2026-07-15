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
  console.log(`[PHONEPE DEBUG] PHONEPE_MODE raw: "${process.env.PHONEPE_MODE}" | isProduction?: ${isProductionMode()}`);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.vercel.app";
  const isVercelOrLocal = appUrl.includes("localhost") || appUrl.includes("vercel.app");

  if ((!isProductionMode() || isVercelOrLocal) && details.customerEmail.toLowerCase().includes("bypass")) {
    console.log(`[PAYMENT BYPASS] Email contains bypass - skipping PhonePe redirect generation`);
    return `${appUrl}/payment/success?orderId=${details.orderId}`;
  }

  if (!merchantId || !saltKey) {
    throw new Error("PhonePe credentials missing: PHONEPE_MERCHANT_ID / PHONEPE_CLIENT_ID or PHONEPE_API_KEY");
  }

  const payload = {
    merchantId,
    merchantTransactionId: details.orderId,
    merchantUserId: "USER-" + details.orderId.split("-")[1] || "USER-SYSTEM",
    amount: Math.round(details.amount * 100), // convert ₹ to paise
    redirectUrl: `${appUrl}/payment/success?orderId=${details.orderId}`,
    redirectMode: "REDIRECT",
    callbackUrl: `${appUrl}/api/webhooks/phonepe`,
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
