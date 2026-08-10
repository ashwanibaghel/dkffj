import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export interface AffiliationCertificatePdfDetails {
  id: string;
  applicationNo: string;
  affiliationNo: string;
  verificationToken: string;
  organizationName: string;
  organizationType: string;
  registrationNumber?: string | null;
  establishmentYear?: string | null;
  district: string;
  state: string;
  address?: string | null;
  validFromStr: string;
  validToStr: string;
  applicantFullName: string;
  applicantDesignation: string;
}

const NAVY = "#001C55";
const GOLD = "#C59B27";
const DARK_GOLD = "#8B6E16";
const TEXT_DARK = "#1E293B";
const MUTED_TEXT = "#475569";
const LIGHT_BG = "#F8FAFC";

export async function generateAffiliationCertificatePdfBuffer(
  details: AffiliationCertificatePdfDetails
): Promise<Buffer> {
  // Pre-fetch QR code buffer
  let qrBuffer: Buffer | null = null;
  try {
    const cleanToken = details.verificationToken || details.id;
    const verifyLink = `https://www.dkffj.org/affiliation/verify/${cleanToken}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=2&ecc=M&data=${encodeURIComponent(verifyLink)}`;
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(qrUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const arr = await res.arrayBuffer();
      qrBuffer = Buffer.from(arr);
    }
  } catch (_) {}

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: `Affiliation Certificate - ${details.affiliationNo}`,
          Author: "DK Foundation of Freedom and Justice",
          Subject: "Official Institute Affiliation Certificate",
          Keywords: "DKFFJ, Affiliation, Certificate, Human Rights"
        }
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const width = doc.page.width;   // ~595.28 pt for A4
      const height = doc.page.height; // ~841.89 pt for A4

      // 1. Outer & Inner Decorative Borders
      doc
        .lineWidth(4)
        .strokeColor(NAVY)
        .rect(18, 18, width - 36, height - 36)
        .stroke();

      doc
        .lineWidth(1)
        .strokeColor(GOLD)
        .rect(24, 24, width - 48, height - 48)
        .stroke();

      // Top Corner Accent Shapes
      doc.fillColor(NAVY).polygon([18, 18], [55, 18], [18, 55]).fill();
      doc.fillColor(NAVY).polygon([width - 18, 18], [width - 55, 18], [width - 18, 55]).fill();
      doc.fillColor(NAVY).polygon([18, height - 18], [55, height - 18], [18, height - 55]).fill();
      doc.fillColor(NAVY).polygon([width - 18, height - 18], [width - 55, height - 18], [width - 18, height - 55]).fill();

      // 2. Header Branding (Matches AffiliationCertificateRenderer.tsx)
      let yCursor = 38;
      const logoPath = path.join(process.cwd(), "public", "logo.png");

      doc
        .fillColor("#a21e1e")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("DK FOUNDATION OF FREEDOM AND JUSTICE", 40, yCursor, {
          width: width - 80,
          align: "center"
        });
      yCursor += 22;

      doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("HUMAN RIGHTS PROTECTION", 40, yCursor, {
          width: width - 80,
          align: "center"
        });
      yCursor += 16;

      doc
        .fillColor("#333333")
        .font("Helvetica-Oblique")
        .fontSize(9)
        .text("Regd. By Ministry of Corporate affairs Govt. of India", 40, yCursor, {
          width: width - 80,
          align: "center"
        });
      yCursor += 22;

      // Affiliation No & Date Row
      const leftX = 45;
      const rightX = width - 185;
      doc
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Affiliation No: `, leftX, yCursor, { continued: true })
        .fillColor("#a21e1e")
        .text(details.affiliationNo);

      doc
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Date: ${details.validFromStr}`, rightX, yCursor, { align: "right", width: 140 });

      yCursor += 25;

      // 3. Certificate Title
      doc
        .fillColor(NAVY)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("CERTIFICATE OF AFFILIATION", 40, yCursor, {
          width: width - 80,
          align: "center"
        });
      yCursor += 32;

      // Logo Image in Center
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, width / 2 - 32, yCursor, { width: 64, height: 64 });
          yCursor += 72;
        } catch (_) {
          yCursor += 10;
        }
      } else {
        yCursor += 10;
      }

      // 4. Certification Body Text (Exact wording from AffiliationCertificateRenderer.tsx)
      const bodyLeft = 50;
      const bodyWidth = width - 100;

      doc
        .fillColor("#222222")
        .font("Helvetica-Oblique")
        .fontSize(11.5)
        .text("This is to officially certify that-", bodyLeft, yCursor);
      yCursor += 22;

      doc
        .fillColor("#333333")
        .font("Helvetica-Oblique")
        .fontSize(11)
        .text("Mr. / Mrs. / Miss: ", bodyLeft, yCursor, { continued: true })
        .fillColor(NAVY)
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(details.applicantFullName);
      yCursor += 20;

      doc
        .fillColor("#333333")
        .font("Helvetica-Oblique")
        .fontSize(11)
        .text("Name of Organisation: ", bodyLeft, yCursor, { continued: true })
        .fillColor("#a21e1e")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(details.organizationName);
      yCursor += 20;

      doc
        .fillColor("#333333")
        .font("Helvetica-Oblique")
        .fontSize(11)
        .text("Designation in DK Foundation: ", bodyLeft, yCursor, { continued: true })
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`${details.applicantDesignation}, District ${details.district}, ${details.state}`);
      yCursor += 28;

      // Grant Statement Paragraph
      doc
        .fillColor("#222222")
        .font("Helvetica")
        .fontSize(11)
        .text("a ", bodyLeft, yCursor, { continued: true })
        .fillColor("#a21e1e")
        .font("Helvetica-Bold")
        .text("Yearly Affiliation ", { continued: true })
        .fillColor("#222222")
        .font("Helvetica")
        .text("is hereby granted to you by the ", { continued: true })
        .font("Helvetica-Bold")
        .text("DK Foundation of Freedom and Justice ", { continued: true })
        .font("Helvetica")
        .text("with effect from ", { continued: true })
        .font("Helvetica-Bold")
        .text(`${details.validFromStr} `, { continued: true })
        .font("Helvetica")
        .text("to ", { continued: true })
        .font("Helvetica-Bold")
        .text(`${details.validToStr}.`);
      yCursor += 32;

      doc
        .fillColor("#333333")
        .font("Helvetica-Oblique")
        .fontSize(9.5)
        .text(
          "You are expected to work actively for the unity, integrity and objectives of the NGO and to cooperate and collaborate with other NGOs.",
          bodyLeft,
          yCursor,
          { width: bodyWidth, lineGap: 3 }
        );
      yCursor += 28;

      doc
        .fillColor("#555555")
        .font("Helvetica-Oblique")
        .fontSize(9)
        .text(
          "This certificate is duly issued by the DK Foundation of Freedom and Justice and is Authenticated by signature and official seal.",
          bodyLeft,
          yCursor,
          { width: bodyWidth, lineGap: 3 }
        );

      // 5. Signatures, ISO Seal & QR Code Block
      const sigY = 635;

      // CEO Signature Image
      const sigPath = path.join(process.cwd(), "public", "images", "director_sig.png");
      if (fs.existsSync(sigPath)) {
        try {
          doc.image(sigPath, 50, sigY - 32, { width: 100, height: 35 });
        } catch (_) {}
      }

      doc
        .lineWidth(1)
        .strokeColor("#555555")
        .moveTo(50, sigY)
        .lineTo(170, sigY)
        .stroke();

      doc
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("(Seal & Signature)", 50, sigY + 4, { width: 120, align: "center" });

      doc
        .fillColor("#333333")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("CEO", 50, sigY + 16, { width: 120, align: "center" });

      // ISO 9001 Seal in Center
      const isoPath = path.join(process.cwd(), "public", "images", "iso.png");
      if (fs.existsSync(isoPath)) {
        try {
          doc.image(isoPath, width / 2 - 35, sigY - 30, { width: 70, height: 70 });
        } catch (_) {}
      }

      // Verification QR Code on Right
      if (qrBuffer) {
        try {
          doc.image(qrBuffer, width - 130, sigY - 30, { width: 68, height: 68 });
        } catch (_) {}
      }

      // 6. Footer Government Logos Band
      const govY = 720;
      const mcaPath = path.join(process.cwd(), "public", "images", "mca.png");
      const nitiPath = path.join(process.cwd(), "public", "images", "niti_aayog.png");
      const nsdcPath = path.join(process.cwd(), "public", "images", "nsdc.png");
      const emblemPath = path.join(process.cwd(), "public", "images", "ministry_of_social_justice.png");
      const msmePath = path.join(process.cwd(), "public", "images", "msme.png");

      if (fs.existsSync(mcaPath)) {
        try { doc.image(mcaPath, 45, govY, { width: 95, height: 42 }); } catch (_) {}
      }
      if (fs.existsSync(nitiPath)) {
        try { doc.image(nitiPath, 150, govY, { width: 75, height: 40 }); } catch (_) {}
      }
      if (fs.existsSync(nsdcPath)) {
        try { doc.image(nsdcPath, 240, govY, { width: 80, height: 40 }); } catch (_) {}
      }
      if (fs.existsSync(emblemPath)) {
        try { doc.image(emblemPath, 335, govY, { width: 75, height: 42 }); } catch (_) {}
      }
      if (fs.existsSync(msmePath)) {
        try { doc.image(msmePath, 430, govY, { width: 85, height: 40 }); } catch (_) {}
      }

      // 7. Footer Head Office Address & Verification Token
      const footerY = 775;
      doc
        .fillColor(NAVY)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("HEAD OFFICE: 41, MAIN COMMERCIAL ROAD, VIKAS PURI, NEW DELHI - 110018", 40, footerY, {
          width: width - 80,
          align: "center"
        });

      doc
        .fillColor(MUTED_TEXT)
        .font("Helvetica")
        .fontSize(7.5)
        .text(`Verification Key: ${details.verificationToken} | Official Verification Portal: www.dkffj.org`, 40, footerY + 12, {
          width: width - 80,
          align: "center"
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
