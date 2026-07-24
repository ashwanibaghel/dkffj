"use server";

import { generateReceiptPdfBuffer, ReceiptPdfDetails } from "@/lib/payment/receiptPdf";

export async function generateAshwaniPaymentReceiptAction() {
  try {
    const details: ReceiptPdfDetails = {
      refId: "PAY-DKF-2026-9027",
      date: new Date().toISOString(),
      ackOrEnrollmentNo: "DKM-2026-9027",
      gatewayTransactionId: "TXN9027872803",
      amount: 1100,
      description: "Official Life Membership & Registration Fee - DK Foundation of Freedom and Justice",
      customerName: "Ashwani Baghel",
      fatherName: "Manoj Kumar",
      customerMobile: "+919027872803",
      customerEmail: "ashwanibaghel9027@gmail.com"
    };

    const pdfBuffer = await generateReceiptPdfBuffer(details);
    return {
      success: true,
      base64: pdfBuffer.toString("base64"),
      filename: "Payment_Receipt_Ashwani_Baghel.pdf"
    };
  } catch (err: any) {
    console.error("Error generating Ashwani payment receipt:", err);
    return {
      success: false,
      error: err?.message || "Failed to generate Payment Receipt PDF"
    };
  }
}
