/**
 * GET /api/phonepe/verify?orderId=XXX
 * Frontend calls this to check if a payment has been completed
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPhonePeOrder } from "@/lib/payment/phonepe";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // First check our DB — if already COMPLETED, return immediately
    const { data: payment } = await supabase
      .from("payments")
      .select("id, status, membership_id, registration_id, donation_id")
      .eq("transaction_id", orderId)
      .maybeSingle();

    if (payment?.status === "COMPLETED") {
      return NextResponse.json({ success: true, status: "COMPLETED", orderId });
    }

    // Otherwise verify with PhonePe directly
    const result = await verifyPhonePeOrder(orderId);

    // If PhonePe says completed but our DB isn't updated yet, trigger update
    if (result.success && payment && payment.status !== "COMPLETED") {
      const { processPaymentCompletion } = await import("../callback/route");
      await processPaymentCompletion(orderId);
    }

    return NextResponse.json({
      success: result.success,
      status: result.state,
      transactionId: result.transactionId,
      orderId,
    });
  } catch (err: any) {
    console.error("PhonePe verify error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
