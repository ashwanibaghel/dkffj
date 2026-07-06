/**
 * PhonePe v2 Payment Gateway Integration
 * Supports both UAT (sandbox) and PRODUCTION modes via PHONEPE_MODE env var
 */

import type { PaymentDetails, PaymentResponse, PaymentGateway } from "./service";

const UAT_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PROD_BASE = "https://api.phonepe.com/apis/pg";

function getBase(): string {
  return process.env.PHONEPE_MODE === "PRODUCTION" ? PROD_BASE : UAT_BASE;
}

function getOAuthUrl(): string {
  return process.env.PHONEPE_MODE === "PRODUCTION" 
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
}

/** Fetch a short-lived OAuth access token from PhonePe */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PhonePe credentials missing: PHONEPE_CLIENT_ID / PHONEPE_CLIENT_SECRET");
  }

  const res = await fetch(getOAuthUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      client_version: "1",
      grant_type: "client_credentials",
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("PhonePe OAuth error:", err);
    throw new Error(`PhonePe token fetch failed: ${res.status}`);
  }

  const json = await res.json();
  if (!json.access_token) {
    throw new Error("PhonePe returned no access_token");
  }
  return json.access_token as string;
}

/** Create a PhonePe checkout order — returns the redirect URL */
export async function createPhonePeOrder(details: PaymentDetails): Promise<string> {
  const token = await getAccessToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.vercel.app";

  const body = {
    merchantOrderId: details.orderId,
    amount: Math.round(details.amount * 100), // convert ₹ to paise
    expireAfter: 1200, // 20 minutes
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Payment to DK Foundation of Freedom & Justice",
      merchantUrls: {
        redirectUrl: `${appUrl}/payment/success?orderId=${details.orderId}`,
      },
    },
  };

  const res = await fetch(`${getBase()}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("PhonePe create order error:", err);
    throw new Error(`PhonePe order creation failed: ${res.status}`);
  }

  const json = await res.json();
  if (!json.redirectUrl) {
    console.error("PhonePe response missing redirectUrl:", json);
    throw new Error("PhonePe did not return a redirectUrl");
  }
  return json.redirectUrl as string;
}

/** Verify payment status for a given merchant order ID */
export async function verifyPhonePeOrder(merchantOrderId: string): Promise<{
  success: boolean;
  state: string;
  transactionId: string;
  amount: number;
}> {
  const token = await getAccessToken();

  const res = await fetch(
    `${getBase()}/checkout/v2/order/${merchantOrderId}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `O-Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("PhonePe status check error:", err);
    return { success: false, state: "FAILED", transactionId: "", amount: 0 };
  }

  const json = await res.json();
  const state: string = json.state || "FAILED";
  const payDetails = json.paymentDetails?.[0] || {};

  return {
    success: state === "COMPLETED",
    state,
    transactionId: payDetails.transactionId || merchantOrderId,
    amount: (json.amount || 0) / 100, // paise → ₹
  };
}

/** PaymentGateway implementation using PhonePe */
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
