import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface ReceiptPdfDetails {
  refId: string;
  date: string;
  ackOrEnrollmentNo: string;
  gatewayTransactionId: string;
  amount: number;
  description: string;
  customerName: string;
  fatherName?: string | null;
  customerMobile: string;
  customerEmail: string;
}

export function generateReceiptPdfBuffer(details: ReceiptPdfDetails): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // 1. Draw outer double border
    const width = doc.page.width;
    const height = doc.page.height;
    
    doc.lineWidth(2);
    doc.rect(20, 20, width - 40, height - 40).stroke("#001C55");
    doc.lineWidth(1);
    doc.rect(24, 24, width - 48, height - 48).stroke("#001C55");

    // 2. Add Watermark logo in center
    try {
      const logoPath = path.join(process.cwd(), "public/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.save();
        doc.opacity(0.03);
        doc.image(logoPath, width / 2 - 125, height / 2 - 125, { width: 250 });
        doc.restore();
      }
    } catch (e) {
      console.warn("Watermark logo load failed:", e);
    }

    // 3. Header Logo & Title
    try {
      const logoPath = path.join(process.cwd(), "public/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 45, 45, { width: 55 });
      }
    } catch (e) {
      console.warn("Header logo load failed:", e);
    }

    doc.fillColor("#001C55");
    doc.fontSize(16);
    doc.font("Helvetica-Bold");
    doc.text("DK FOUNDATION OF FREEDOM & JUSTICE", 115, 45);

    doc.fillColor("#475569");
    doc.fontSize(8);
    doc.font("Helvetica-Bold");
    doc.text("Incorporated under Section 8 of the Companies Act, 2013, Govt. of India", 115, 63);
    doc.font("Helvetica");
    doc.text("CIN: U74999DL2018NPL334888 • Reg No: N-334888", 115, 74);

    doc.moveDown(1.5);
    doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, 110).lineTo(width - 40, 110).stroke();

    // Receipt header ribbon
    doc.fillColor("#001C55");
    doc.rect(40, 120, width - 80, 22).fill();
    doc.fillColor("#ffffff");
    doc.fontSize(9);
    doc.font("Helvetica-Bold");
    doc.text("OFFICIAL PAYMENT ACKNOWLEDGEMENT RECEIPT", 45, 127, { align: "center", width: width - 90 });

    // 4. Receipt details grid
    doc.fillColor("#1e293b");
    doc.fontSize(8);
    
    // Left block
    doc.font("Helvetica-Bold").text("RECEIPT DETAILS", 45, 155);
    doc.font("Helvetica").text("Receipt No: ", 45, 170).font("Helvetica-Bold").text(details.refId, 110, 170);
    const formattedDate = new Date(details.date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
    doc.font("Helvetica").text("Date & Time: ", 45, 183).font("Helvetica-Bold").text(formattedDate, 110, 183);
    doc.font("Helvetica").text("Reference No: ", 45, 196).font("Helvetica-Bold").text(details.ackOrEnrollmentNo, 110, 196);
    doc.font("Helvetica").text("Payment Status: ", 45, 209).font("Helvetica-Bold").fillColor("#166534").text("SUCCESSFUL / PAID", 110, 209).fillColor("#1e293b");

    // Right block
    doc.font("Helvetica-Bold").text("TRANSACTION DETAILS", 300, 155);
    doc.font("Helvetica").text("Gateway Provider: ", 300, 170).font("Helvetica-Bold").text("PhonePe UPI", 380, 170);
    doc.font("Helvetica").text("Transaction ID: ", 300, 183).font("Helvetica-Bold").text(details.gatewayTransactionId, 380, 183);
    doc.font("Helvetica").text("Currency: ", 300, 196).font("Helvetica-Bold").text("INR (Rs.)", 380, 196);
    doc.font("Helvetica").text("Amount Paid: ", 300, 209).font("Helvetica-Bold").fillColor("#166534").text(`Rs. ${details.amount.toLocaleString("en-IN")}.00`, 380, 209).fillColor("#1e293b");

    doc.strokeColor("#e2e8f0").moveTo(40, 225).lineTo(width - 40, 225).stroke();

    // 5. Payee credentials card
    doc.fillColor("#001C55");
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("CANDIDATE / PAYEE CREDENTIALS", 45, 238);

    doc.fillColor("#1e293b");
    doc.fontSize(8);
    doc.font("Helvetica").text("Applicant Name:", 45, 255).font("Helvetica-Bold").text(details.customerName.toUpperCase(), 120, 255);
    if (details.fatherName && details.fatherName !== "N/A") {
      doc.font("Helvetica").text("Father's Name:", 45, 268).font("Helvetica-Bold").text(details.fatherName.toUpperCase(), 120, 268);
    }
    doc.font("Helvetica").text("Contact Number:", 300, 255).font("Helvetica-Bold").text(details.customerMobile, 385, 255);
    doc.font("Helvetica").text("Registered Email:", 300, 268).font("Helvetica-Bold").text(details.customerEmail, 385, 268);

    doc.strokeColor("#e2e8f0").moveTo(40, 285).lineTo(width - 40, 285).stroke();

    // 6. Particulars Table
    const tableTop = 300;
    doc.fillColor("#001C55");
    doc.rect(40, tableTop, width - 80, 20).fill();
    doc.fillColor("#ffffff");
    doc.font("Helvetica-Bold").fontSize(8);
    doc.text("S.No.", 50, tableTop + 6);
    doc.text("Particulars / Head of Account", 90, tableTop + 6);
    doc.text("Amount (INR)", 450, tableTop + 6, { align: "right", width: 95 });

    doc.fillColor("#1e293b");
    doc.font("Helvetica");
    const rowTop = tableTop + 20;
    doc.rect(40, rowTop, width - 80, 50).stroke("#cbd5e1");
    doc.text("01", 50, rowTop + 12);
    doc.font("Helvetica-Bold").text(details.description.toUpperCase(), 90, rowTop + 12);
    doc.font("Helvetica").fontSize(7).fillColor("#64748b").text("Official registration & processing charges for DKFFJ membership/enrollment", 90, rowTop + 24).fontSize(8).fillColor("#1e293b");
    doc.font("Helvetica-Bold").text(`Rs. ${details.amount.toLocaleString("en-IN")}.00`, 450, rowTop + 12, { align: "right", width: 95 });

    // Subtotal and Total rows
    const summaryTop = rowTop + 50;
    doc.rect(40, summaryTop, width - 80, 60).stroke("#cbd5e1");
    doc.font("Helvetica").text("Subtotal:", 350, summaryTop + 10, { align: "right", width: 90 });
    doc.font("Helvetica-Bold").text(`Rs. ${details.amount.toLocaleString("en-IN")}.00`, 450, summaryTop + 10, { align: "right", width: 95 });

    doc.font("Helvetica").text("CGST (0%) + SGST (0%):", 350, summaryTop + 25, { align: "right", width: 90 });
    doc.font("Helvetica-Bold").text("Rs. 0.00", 450, summaryTop + 25, { align: "right", width: 95 });

    // Grand total fill
    doc.fillColor("#001C55").rect(41, summaryTop + 38, width - 82, 21).fill();
    doc.fillColor("#ffffff");
    doc.font("Helvetica-Bold").text("GRAND TOTAL PAID (INR):", 50, summaryTop + 45);
    doc.font("Helvetica-Bold").text(`Rs. ${details.amount.toLocaleString("en-IN")}.00`, 450, summaryTop + 45, { align: "right", width: 95 });

    // 7. Signature area (NO placeholder seal)
    const footerTop = height - 120;
    doc.fillColor("#94a3b8").strokeColor("#cbd5e1").lineWidth(0.5).moveTo(40, footerTop).lineTo(width - 40, footerTop).stroke();

    doc.fillColor("#64748b").fontSize(7).font("Helvetica-Bold").text("Electronic Verification Audit:", 45, footerTop + 6);
    doc.font("Helvetica").text("This document is a computer-generated official payment receipt issued under the authority of DK Foundation of Freedom & Justice. No signature is legally required for digital validation. System transaction references have been recorded securely in the audit trails.", 45, footerTop + 14, { width: 320, align: "justify" });

    // Signature image
    try {
      const sigPath = path.join(process.cwd(), "public/images/director_sig.png");
      if (fs.existsSync(sigPath)) {
        doc.image(sigPath, 430, footerTop + 2, { width: 110, height: 45 });
      }
    } catch (e) {
      console.warn("Signature image load failed:", e);
    }

    // Signature line and label
    doc.strokeColor("#94a3b8").lineWidth(0.5).moveTo(430, footerTop + 50).lineTo(540, footerTop + 50).stroke();
    doc.fillColor("#475569").fontSize(6).font("Helvetica-Bold").text("AUTHORIZED SIGNATORY", 430, footerTop + 54, { align: "center", width: 110 });
    doc.fontSize(5).font("Helvetica").text("DK Foundation of Freedom & Justice", 430, footerTop + 62, { align: "center", width: 110 });

    doc.end();
  });
}
