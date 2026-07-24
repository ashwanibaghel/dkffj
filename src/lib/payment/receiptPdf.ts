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

const BLUE = "#213f8f";
const INK = "#172033";
const MUTED = "#607089";
const LINE = "#c8d2df";
const PALE_BLUE = "#edf5ff";
const GREEN = "#168341";
const PALE_GREEN = "#effcf3";

function amountInWords(value: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const belowThousand = (number: number): string => {
    const parts: string[] = [];
    if (number >= 100) {
      parts.push(`${ones[Math.floor(number / 100)]} Hundred`);
      number %= 100;
    }
    if (number >= 20) {
      parts.push(tens[Math.floor(number / 10)]);
      number %= 10;
    }
    if (number > 0) parts.push(ones[number]);
    return parts.join(" ");
  };

  let number = Math.max(0, Math.floor(value));
  if (number === 0) return "Zero";
  const parts: string[] = [];
  const groups: Array<[number, string]> = [
    [10_000_000, "Crore"],
    [100_000, "Lakh"],
    [1_000, "Thousand"],
  ];
  for (const [divisor, label] of groups) {
    if (number >= divisor) {
      parts.push(`${belowThousand(Math.floor(number / divisor))} ${label}`);
      number %= divisor;
    }
  }
  if (number) parts.push(belowThousand(number));
  return parts.join(" ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(value: number): string {
  return `INR ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateReceiptPdfBuffer(details: ReceiptPdfDetails): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `Receipt ${details.refId}` } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const width = doc.page.width;
    const height = doc.page.height;
    const left = 43;
    const right = width - 43;
    const contentWidth = right - left;

    // Clean single-line frame, matching the supplied e-receipt.
    doc.lineWidth(1.6).roundedRect(27, 25, width - 54, height - 50, 7).stroke(BLUE);

    // Header.
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(20);
    doc.text("DK FOUNDATION OF FREEDOM", left, 47, { width: 385 });
    doc.text("AND JUSTICE", left, 73, { width: 385 });
    doc.fillColor("#4e5d72").fontSize(8.8);
    doc.text("DK Foundation of Freedom and Justice (Section 8 Non-Profit Organization)", left, 101);
    doc.font("Helvetica").fontSize(7.8);
    doc.text("Website: www.dkffj.org  |  ISO 9001:2015 Certified: QCCI/23Q/DOE/2909", left, 118);

    doc.fillColor(BLUE).roundedRect(right - 133, 59, 133, 30, 2).fill();
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12);
    doc.text("E-RECEIPT", right - 133, 68, { width: 133, align: "center" });
    doc.fillColor("#445268").fontSize(8);
    doc.text(`Date: ${new Date(details.date).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })}`, right - 170, 97, { width: 170, align: "right" });
    doc.text(`Receipt No: ${details.refId}`, right - 190, 109, { width: 190, align: "right" });
    doc.strokeColor(BLUE).lineWidth(1.4).moveTo(left, 132).lineTo(right, 132).stroke();

    // Notice band.
    doc.fillColor(PALE_BLUE).roundedRect(left, 145, contentWidth, 64, 4).fill();
    doc.strokeColor("#9bc7ff").lineWidth(0.7).roundedRect(left, 145, contentWidth, 64, 4).stroke();
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(8.5);
    doc.text("PAYMENT ACKNOWLEDGEMENT / TAX EXEMPTION NOTICE", left + 12, 155, {
      width: contentWidth - 24,
      align: "center",
    });
    doc.font("Helvetica").fontSize(8.2);
    doc.text(
      "This receipt acknowledges the payment received by DK Foundation of Freedom and Justice. Eligible donations may claim tax exemption under Section 80G of the Income Tax Act, 1961.",
      left + 20,
      171,
      { width: contentWidth - 40, align: "center", lineGap: 2 },
    );
    doc.font("Helvetica-Bold").text(
      "12A DIN: AAKCD1596RE2024101  |  80G DIN: AAKCD1596RF2024101",
      left + 20,
      195,
      { width: contentWidth - 40, align: "center" },
    );

    // Transaction/payee information.
    const label = (text: string, x: number, y: number) =>
      doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(8).text(text, x, y);
    const value = (text: string, x: number, y: number, w: number) =>
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(8.5).text(text, x, y, { width: w });

    label("Transaction ID:", left + 5, 229);
    value(details.gatewayTransactionId, left + 94, 229, 185);
    label("Payment Mode:", left + 286, 229);
    value("Online Gateway (UPI/Card/NetBanking)", left + 373, 229, 121);

    label("Applicant / Donor:", left + 5, 261);
    value(details.customerName, left + 94, 261, 185);
    label("Reference No:", left + 286, 261);
    value(details.ackOrEnrollmentNo, left + 373, 261, 121);

    label("Mobile / Email:", left + 5, 282);
    value(`${details.customerMobile}\n${details.customerEmail}`, left + 94, 282, 185);
    label("Payment Date:", left + 286, 282);
    value(formatDate(details.date), left + 373, 282, 121);

    // Particulars table.
    const tableTop = 326;
    doc.fillColor("#edf1f6").rect(left, tableTop, contentWidth, 27).fill();
    doc.strokeColor(LINE).lineWidth(0.7).rect(left, tableTop, contentWidth, 85).stroke();
    doc.moveTo(left, tableTop + 27).lineTo(right, tableTop + 27).stroke();
    doc.fillColor("#3b495e").font("Helvetica-Bold").fontSize(8.5);
    doc.text("S.NO.", left + 10, tableTop + 9);
    doc.text("DESCRIPTION / HEAD OF ACCOUNT", left + 61, tableTop + 9);
    doc.text("AMOUNT (INR)", right - 100, tableTop + 9, { width: 88, align: "right" });
    doc.fillColor(INK).fontSize(9);
    doc.text("1", left + 10, tableTop + 49);
    doc.text(details.description, left + 61, tableTop + 39, { width: 300 });
    doc.fillColor(MUTED).font("Helvetica").fontSize(7.5);
    doc.text("Payment received and recorded through the official online portal", left + 61, tableTop + 56, { width: 300 });
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(9);
    doc.text(money(details.amount), right - 115, tableTop + 48, { width: 103, align: "right" });

    // Amount in words.
    const totalTop = 424;
    doc.fillColor(PALE_GREEN).roundedRect(left, totalTop, contentWidth, 51, 4).fill();
    doc.strokeColor("#22a958").lineWidth(1).dash(4, { space: 3 }).roundedRect(left, totalTop, contentWidth, 51, 4).stroke().undash();
    doc.fillColor("#176c39").font("Helvetica-Bold").fontSize(7.7);
    doc.text("TOTAL AMOUNT RECEIVED IN WORDS:", left + 11, totalTop + 13);
    doc.font("Helvetica-BoldOblique").fontSize(10);
    doc.text(`Rupees ${amountInWords(details.amount)} Only`, left + 11, totalTop + 28, { width: 300 });
    doc.font("Helvetica").fontSize(8);
    doc.text("Total Paid:", right - 205, totalTop + 25, { width: 64, align: "right" });
    doc.font("Helvetica-Bold").fontSize(14).fillColor(GREEN);
    doc.text(money(details.amount), right - 137, totalTop + 21, { width: 126, align: "right" });

    // Statutory credentials.
    const credentialsTop = 488;
    doc.fillColor("#f7f9fc").roundedRect(left, credentialsTop, contentWidth, 128, 4).fill();
    doc.strokeColor("#dbe2eb").lineWidth(0.7).roundedRect(left, credentialsTop, contentWidth, 128, 4).stroke();
    doc.fillColor("#35445a").font("Helvetica-Bold").fontSize(8.7);
    doc.text("ORGANIZATION STATUTORY CREDENTIALS", left + 10, credentialsTop + 11);
    doc.strokeColor(LINE).moveTo(left + 10, credentialsTop + 25).lineTo(right - 10, credentialsTop + 25).stroke();

    const credentials = [
      ["CIN:", "U88900UP2023NPL185611", "PAN:", "AAKCD1596R", "TAN:", "LKND10615D"],
      ["Section 8 License No:", "146043", "NITI Aayog Unique ID:", "UP/2023/0351342", "NGO ID:", "UP/00034249"],
      ["CSR Reg. No:", "CSR00068100", "MSME UDYAM:", "UDYAM-UP-43-0117271", "ISO Cert.:", "QCCI/23Q/DOE/2909"],
      ["12A DIN:", "AAKCD1596RE2024101", "80G DIN:", "AAKCD1596RF2024101", "Min. of Edu. ISBN:", "28791/ISBN/2024/P"],
    ];
    credentials.forEach((row, index) => {
      const y = credentialsTop + 37 + index * 21;
      [0, 1, 2].forEach((column) => {
        const x = left + 12 + column * 166;
        doc.fillColor("#253247").font("Helvetica-Bold").fontSize(6.6).text(row[column * 2], x, y, { width: 72 });
        doc.fillColor("#53637a").font("Helvetica").fontSize(6.6).text(row[column * 2 + 1], x + 73, y, { width: 91 });
      });
    });

    // Footer verification and signatory.
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        doc.save().opacity(0.045).image(logoPath, width / 2 - 85, 310, { width: 170 }).restore();
      }
    } catch (error) {
      console.warn("Receipt watermark could not be loaded:", error);
    }

    doc.strokeColor(LINE).rect(left, 642, 58, 58).stroke();
    doc.fillColor(BLUE).rect(left + 9, 651, 17, 17).fill().rect(left + 32, 651, 17, 17).fill().rect(left + 9, 674, 17, 17).fill();
    doc.rect(left + 31, 675, 7, 7).fill().rect(left + 40, 681, 9, 9).fill();
    doc.fillColor(MUTED).font("Helvetica").fontSize(6).text("Scan to Verify Receipt", left, 706, { width: 72 });

    doc.fillColor(MUTED).fontSize(7.2);
    doc.text(
      "- This is a computer-generated receipt for an online payment transaction.\n- No physical signature is required.\n- Subject to realization of funds if payment is under processing.\n- For queries: support@dkffj.org | www.dkffj.org",
      left + 105,
      656,
      { width: 260, lineGap: 2 },
    );

    try {
      const signaturePath = path.join(process.cwd(), "public", "images", "director_sig.png");
      if (fs.existsSync(signaturePath)) doc.image(signaturePath, right - 145, 643, { fit: [115, 37], align: "center" });
    } catch (error) {
      console.warn("Receipt signature could not be loaded:", error);
    }
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(7.7);
    doc.text("DK Foundation of Freedom and Justice", right - 155, 631, { width: 145, align: "center" });
    doc.strokeColor("#9ba9bb").moveTo(right - 145, 685).lineTo(right, 685).stroke();
    doc.fillColor(INK).fontSize(7.5);
    doc.text("Authorized Signatory", right - 145, 691, { width: 145, align: "center" });

    doc.fillColor("#77869b").font("Helvetica").fontSize(6.5);
    doc.text(`Digitally generated on ${formatDate(details.date)} | Receipt reference: ${details.refId}`, left, height - 42, {
      width: contentWidth,
      align: "center",
    });

    doc.end();
  });
}
