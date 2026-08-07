import { NextRequest, NextResponse } from "next/server";
import { generateReceiptPdfBuffer } from "@/lib/payment/receiptPdf";
import { findDevAffiliationById } from "@/lib/affiliation-dev-store";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { AFFILIATION_FEE_DESCRIPTION, AFFILIATION_FEE_NOTE, AFFILIATION_RECEIPT_PREFIX } from "@/lib/affiliation-config";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId") || searchParams.get("appNo") || searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "orderId or appNo is required" }, { status: 400 });
    }

    let customerName = "";
    let customerMobile = "";
    let customerEmail = "";
    let instituteName = "";
    let ackOrEnrollmentNo = "";
    let gatewayTransactionId = "";
    let amount = 2100;
    let paidDate = new Date().toISOString();
    let receiptNo = "";
    let paymentStatus = "";

    // 1. Try Dev Store
    const devItem = findDevAffiliationById(orderId);
    if (devItem) {
      const p = devItem.payment;
      if (!p || p.status !== "COMPLETED" || Number(p.amount) !== 2100 || (!p.gatewayTransactionId && !p.transactionId) || !p.paidAt) {
        return NextResponse.json({ error: "Receipt unavailable because payment has not been successfully verified." }, { status: 400 });
      }
      customerName = devItem.applicant.fullName;
      customerMobile = devItem.applicant.mobile;
      customerEmail = devItem.applicant.email;
      instituteName = devItem.organizationName;
      ackOrEnrollmentNo = devItem.applicationNo;
      gatewayTransactionId = p.gatewayTransactionId || p.transactionId;
      amount = Number(p.amount);
      paidDate = p.paidAtIST || p.paidAt;
      receiptNo = p.receiptNo || `${AFFILIATION_RECEIPT_PREFIX}${new Date().getFullYear()}/${devItem.applicationNo.split("-").pop() || "000001"}`;
      paymentStatus = p.status;
    } else {
      // 2. Try Supabase
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const { data: payment } = await supabase
        .from("payments")
        .select(`
          id, amount, transaction_id, gateway_transaction_id, status, created_at, paid_at, receipt_no, affiliation_id,
          affiliations (
            id, application_no, organization_name,
            affiliation_applicants ( full_name, mobile, email )
          )
        `)
        .or(`transaction_id.eq.${orderId},affiliation_id.eq.${orderId}`)
        .maybeSingle();

      const txnId = payment?.gateway_transaction_id || payment?.transaction_id;
      const paidTimestamp = payment?.paid_at || payment?.created_at;

      if (!payment || payment.status !== "COMPLETED" || Number(payment.amount) !== 2100 || !txnId || !paidTimestamp) {
        return NextResponse.json({ error: "Receipt unavailable because payment has not been successfully verified." }, { status: 400 });
      }

      const aff = payment.affiliations as any;
      const applicant = aff?.affiliation_applicants?.[0] || aff?.affiliation_applicants || {};

      customerName = applicant.full_name || "Applicant";
      customerMobile = applicant.mobile || "";
      customerEmail = applicant.email || "";
      instituteName = aff?.organization_name || "";
      ackOrEnrollmentNo = aff?.application_no || orderId;
      gatewayTransactionId = txnId;
      amount = Number(payment.amount);
      paidDate = paidTimestamp;
      receiptNo = payment.receipt_no || `${AFFILIATION_RECEIPT_PREFIX}${new Date().getFullYear()}/${ackOrEnrollmentNo.split("-").pop() || "000001"}`;
      paymentStatus = payment.status;
    }

    const pdfBuffer = await generateReceiptPdfBuffer({
      refId: ackOrEnrollmentNo,
      receiptNo,
      date: paidDate,
      ackOrEnrollmentNo,
      gatewayTransactionId,
      amount,
      description: AFFILIATION_FEE_DESCRIPTION,
      customerName,
      customerMobile,
      customerEmail,
      instituteName,
      receiptType: "AFFILIATION",
      refundPolicyNote: AFFILIATION_FEE_NOTE
    });

    const cleanFilename = `Receipt_${ackOrEnrollmentNo.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cleanFilename}"`,
        "Cache-Control": "no-cache"
      }
    });
  } catch (err: any) {
    console.error("Error generating affiliation receipt PDF:", err);
    return NextResponse.json({ error: err.message || "Failed to generate receipt PDF" }, { status: 500 });
  }
}
