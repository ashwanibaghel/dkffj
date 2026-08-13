"use client";

import React from "react";
import { getBase64ImageFromUrl } from "../registrations/CertificateGenerator";
import { cleanAmpText } from "@/lib/sanitize";

export interface AffiliationCertificateData {
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
  validFromStr?: string;
  validToStr?: string;
  applicantFullName: string;
  applicantDesignation?: string;
  applicantPhotoUrl?: string | null;
  qrCodeUrl?: string | null;
  verificationUrl?: string | null;
  approvedDomains?: string[];
  createdAtStr?: string;
}

interface AffiliationCertificateRendererProps {
  data: AffiliationCertificateData;
  photoBase64?: string;
  qrBase64?: string;
  logoBase64?: string;
  mcaBase64?: string;
  nitiBase64?: string;
  nsdcBase64?: string;
  msmeBase64?: string;
  emblemBase64?: string;
  isoSealBase64?: string;
  signatureBase64?: string;
  borderBase64?: string;
}

export const AffiliationCertificateRenderer: React.FC<AffiliationCertificateRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  logoBase64,
  mcaBase64,
  nitiBase64,
  nsdcBase64,
  msmeBase64,
  emblemBase64,
  isoSealBase64,
  signatureBase64,
  borderBase64
}) => {
  // Format Affiliation Number as DKFFJ/F/YEAR/XXXX
  const currentYear = new Date().getFullYear().toString();
  let rawAffNo = data.affiliationNo || `DKFFJ/F/${currentYear}/0001`;
  if (!rawAffNo.startsWith("DKFFJ/F/")) {
    const parts = rawAffNo.split("/");
    const lastNum = parts[parts.length - 1] || "0001";
    rawAffNo = `DKFFJ/F/${currentYear}/${lastNum.padStart(4, "0")}`;
  }
  const formattedAffiliationNo = rawAffNo;

  // Issue Date formatting (No valid-from or valid-to on main certificate)
  const issueDate = data.validFromStr || data.createdAtStr || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const logoSrc = logoBase64 || "/logo.png";
  const mcaSrc = mcaBase64 || "/images/mca.png";
  const nitiSrc = nitiBase64 || "/images/niti_aayog.png";
  const nsdcSrc = nsdcBase64 || "/images/nsdc.png";
  const msmeSrc = msmeBase64 || "/images/msme.png";
  const emblemSrc = emblemBase64 || "/images/ministry_of_social_justice.png";
  const isoSealSrc = isoSealBase64 || "/images/iso.png";
  const signatureSrc = signatureBase64 || "/images/director_sig.png";
  const borderSrc = borderBase64 || "/images/affiliation-institutional-border-a4-landscape.svg";

  // Verification QR Code
  const cleanVerifyToken = data.verificationToken || data.id;
  let rawVerifyLink = data.verificationUrl || `https://www.dkffj.org/affiliation/verify/${cleanVerifyToken}`;
  rawVerifyLink = rawVerifyLink
    .replace(/https?:\/\/localhost:\d+/gi, "https://www.dkffj.org")
    .replace(/https?:\/\/[^/]*vercel\.app/gi, "https://www.dkffj.org");

  const computedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(rawVerifyLink)}`;
  const qrSrc = qrBase64 || data.qrCodeUrl || computedQrUrl;

  const cleanApplicantName = cleanAmpText(data.applicantFullName || "Authorized Representative");
  const cleanOrgName = cleanAmpText(data.organizationName || "Partner Organization").toUpperCase();
  const cleanDistrict = cleanAmpText(data.district || "District");
  const cleanState = cleanAmpText(data.state || "State");

  // Dynamic Font Size & Line Wrapping for Institute Name based on character length
  const orgNameLength = cleanOrgName.length;
  let orgFontSize = 44;
  let isMultiLineOrg = false;
  let orgLine1 = cleanOrgName;
  let orgLine2 = "";

  if (orgNameLength > 50) {
    isMultiLineOrg = true;
    orgFontSize = 35;
    const words = cleanOrgName.split(" ");
    const mid = Math.ceil(words.length / 2);
    orgLine1 = words.slice(0, mid).join(" ");
    orgLine2 = words.slice(mid).join(" ");
  } else if (orgNameLength > 35) {
    orgFontSize = 38;
  } else {
    orgFontSize = 44;
  }

  // Underline width calculation (max 780px in portrait canvas)
  const underlineWidth = Math.min(780, Math.max(360, (isMultiLineOrg ? Math.max(orgLine1.length, orgLine2.length) : orgNameLength) * (orgFontSize * 0.58)));
  const underlineX1 = 620 - underlineWidth / 2;
  const underlineX2 = 620 + underlineWidth / 2;

  return (
    <div
      id={`affiliation-certificate-render-container-${data.id || data.applicationNo}`}
      style={{
        width: "1240px", // A4 Portrait Master Canvas (1240x1754)
        height: "1754px",
        position: "relative",
        backgroundColor: "#F7EED7", // Base warm ivory parchment
        boxSizing: "border-box",
        overflow: "hidden",
        margin: "0 auto"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,500;1,600;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      {/* A4 PORTRAIT DETERMINISTIC SVG COMPOSITION (viewBox="0 0 1240 1754") */}
      <svg
        viewBox="0 0 1240 1754"
        width="1240"
        height="1754"
        style={{
          width: "100%",
          height: "100%",
          display: "block"
        }}
      >
        <defs>
          <linearGradient id="goldGradientSVG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D3A745" />
            <stop offset="30%" stopColor="#F7E7A1" />
            <stop offset="60%" stopColor="#C89C38" />
            <stop offset="100%" stopColor="#80601B" />
          </linearGradient>
        </defs>

        {/* 1. Main Frame Architecture & Background SVG Layer */}
        <image href={borderSrc} xlinkHref={borderSrc} x="0" y="0" width="1240" height="1754" preserveAspectRatio="none" />

        {/* 2. Main Central Emblem Watermark (cx: 620, cy: 820, diameter: 700px, opacity: 0.05) */}
        <image
          href={logoSrc}
          xlinkHref={logoSrc}
          x="270"
          y="470"
          width="700"
          height="700"
          preserveAspectRatio="xMidYMid meet"
          opacity="0.05"
        />

        {/* 3. Header Section with SINGLE PROMINENT TOP-CENTER DKFFJ LOGO */}
        <image
          href={logoSrc}
          xlinkHref={logoSrc}
          x="545"
          y="60"
          width="150"
          height="150"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Main Organization Heading (620, 235, 40px Cinzel bold serif - No horizontal compression) */}
        <text
          x="620"
          y="235"
          fill="#7B151C"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="800"
          fontSize="40"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          DK FOUNDATION OF FREEDOM AND JUSTICE
        </text>

        {/* Human Rights Protection Subhead (620, 275) */}
        <text
          x="620"
          y="275"
          fill="#061D48"
          fontFamily="'Inter', Arial, sans-serif"
          fontWeight="900"
          fontSize="26"
          textAnchor="middle"
          letterSpacing="2"
        >
          HUMAN RIGHTS PROTECTION
        </text>

        {/* Registration Line (620, 305) */}
        <text
          x="620"
          y="305"
          fill="#222222"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="19"
          textAnchor="middle"
        >
          Regd. By Ministry of Corporate Affairs, Govt. of India
        </text>

        {/* Decorative Divider Under Header (cx: 620, y: 330) */}
        <line x1="220" y1="330" x2="540" y2="330" stroke="#C89C38" strokeWidth="2.5" />
        <line x1="700" y1="330" x2="1020" y2="330" stroke="#C89C38" strokeWidth="2.5" />
        <circle cx="620" cy="330" r="5" fill="#7B151C" />

        {/* 4. Affiliation Metadata Row (70 & 1170, 375) */}
        {/* Left: Affiliation No */}
        <text x="70" y="375" fontFamily="'Inter', sans-serif" fontSize="18.5" fontWeight="700" fill="#061D48">
          <tspan fill="#061D48">Affiliation No.:</tspan>
          <tspan fill="#7B151C" fontFamily="monospace" fontWeight="800" dx="12">{formattedAffiliationNo}</tspan>
        </text>

        {/* Right: Issue Date */}
        <text x="1170" y="375" fontFamily="'Inter', sans-serif" fontSize="18.5" fontWeight="700" fill="#061D48" textAnchor="end">
          <tspan fill="#061D48">Issue Date:</tspan>
          <tspan fill="#061D48" fontWeight="800" dx="12">{issueDate}</tspan>
        </text>

        {/* 5. Main Certificate Title (620, 445) */}
        <text
          x="620"
          y="445"
          fill="#071F4A"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="900"
          fontSize="50"
          textAnchor="middle"
          letterSpacing="3.5"
        >
          CERTIFICATE OF AFFILIATION
        </text>

        {/* Subtitle & Gold Dividers (620, 492) */}
        <line x1="210" y1="486" x2="340" y2="486" stroke="#C89C38" strokeWidth="2.2" />
        <text
          x="620"
          y="492"
          fill="#C89C38"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="800"
          fontSize="23"
          textAnchor="middle"
          letterSpacing="2.8"
        >
          INSTITUTIONAL TRAINING AFFILIATION
        </text>
        <line x1="900" y1="486" x2="1030" y2="486" stroke="#C89C38" strokeWidth="2.2" />

        {/* Small Flourish Beneath Subtitle (y: 518) */}
        <path d="M 580 518 Q 600 512 620 518 Q 640 524 660 518 Q 640 512 620 518 Q 600 524 580 518 Z" fill="#C89C38" opacity="0.9" />
        <circle cx="620" cy="518" r="3.5" fill="#7B151C" />

        {/* 6. Intro Line (620, 560) */}
        <text
          x="620"
          y="560"
          fill="#222222"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="23"
          textAnchor="middle"
        >
          This is to officially certify that
        </text>

        {/* 7. Hero Institute Name (Dynamic Font Size & Line Wrapping - No Horizontal Compression) */}
        {!isMultiLineOrg ? (
          <>
            <text
              x="620"
              y="620"
              fill="#071F4A"
              fontFamily="'Cinzel', Georgia, serif"
              fontWeight="900"
              fontSize={orgFontSize}
              textAnchor="middle"
              letterSpacing="1"
            >
              {orgLine1}
            </text>
            <line x1={underlineX1} y1="638" x2={underlineX2} y2="638" stroke="#C89C38" strokeWidth="2.5" />
            <polygon points="620,634 626,638 620,642 614,638" fill="#C89C38" />
          </>
        ) : (
          <>
            <text
              x="620"
              y="615"
              fill="#071F4A"
              fontFamily="'Cinzel', Georgia, serif"
              fontWeight="900"
              fontSize={orgFontSize}
              textAnchor="middle"
              letterSpacing="1"
            >
              {orgLine1}
            </text>
            <text
              x="620"
              y="655"
              fill="#071F4A"
              fontFamily="'Cinzel', Georgia, serif"
              fontWeight="900"
              fontSize={orgFontSize}
              textAnchor="middle"
              letterSpacing="1"
            >
              {orgLine2}
            </text>
            <line x1={underlineX1} y1="675" x2={underlineX2} y2="675" stroke="#C89C38" strokeWidth="2.5" />
            <polygon points="620,671 626,675 620,679 614,675" fill="#C89C38" />
          </>
        )}

        {/* 8. Representative + Location Row (620, 730) */}
        <text x="620" y="730" fontFamily="'Inter', sans-serif" fontSize="21" fontWeight="700" textAnchor="middle">
          <tspan fill="#555555" fontWeight="600">Represented by: </tspan>
          <tspan fill="#071F4A" fontWeight="800" dx="4">{cleanApplicantName}</tspan>
          <tspan fill="#C89C38" fontWeight="800" dx="18">   •   </tspan>
          <tspan fill="#555555" fontWeight="600" dx="18">Location: </tspan>
          <tspan fill="#111111" fontWeight="800" dx="4">{cleanDistrict}, {cleanState}</tspan>
        </text>

        {/* 9. Grant Statement (3 Controlled Lines) */}
        {/* Line 1 (620, 778) */}
        <text
          x="620"
          y="778"
          fill="#222222"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="22"
          textAnchor="middle"
        >
          has been granted
        </text>

        {/* Line 2 (620, 820) */}
        <text
          x="620"
          y="820"
          fill="#8B1E24"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="800"
          fontSize="30"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          Institutional Training Affiliation
        </text>

        {/* Line 3 (620, 860) */}
        <text
          x="620"
          y="860"
          fill="#071F4A"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="800"
          fontSize="24"
          textAnchor="middle"
        >
          by DK Foundation of Freedom and Justice.
        </text>

        {/* 10. Disclaimer Block (2 Controlled Lines) */}
        {/* Line 1 (620, 900) */}
        <text
          x="620"
          y="900"
          fill="#444444"
          fontFamily="'Inter', sans-serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="18.5"
          textAnchor="middle"
        >
          This affiliation is valid only for the courses/programs approved by DKFFJ
        </text>

        {/* Line 2 (620, 922) */}
        <text
          x="620"
          y="922"
          fill="#444444"
          fontFamily="'Inter', sans-serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="18.5"
          textAnchor="middle"
        >
          and listed in Annexure-A / the official verification record.
        </text>

        {/* 11. DEDICATED AUTHENTICATION ROW (Optically Centered at x=250, x=620, x=990) */}
        {/* LEFT ZONE: CEO Signature (Centered at x=250) */}
        {signatureSrc && (
          <image href={signatureSrc} xlinkHref={signatureSrc} x="145" y="990" width="210" height="72" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />
        )}
        <line x1="125" y1="1064" x2="375" y2="1064" stroke="#111111" strokeWidth="2" />
        <text x="250" y="1084" fill="#111111" fontFamily="'Inter', sans-serif" fontSize="14.5" fontWeight="700" textAnchor="middle">
          (Seal &amp; Signature)
        </text>
        <text x="250" y="1106" fill="#071F4A" fontFamily="'Cinzel', Georgia, serif" fontSize="16" fontWeight="800" textAnchor="middle">
          CHIEF EXECUTIVE OFFICER
        </text>
        <text x="250" y="1124" fill="#555555" fontFamily="'Inter', sans-serif" fontSize="13" textAnchor="middle">
          DK Foundation of Freedom and Justice
        </text>

        {/* CENTER ZONE: ISO Seal (Centered at x=620, 130x130) */}
        <image href={isoSealSrc} xlinkHref={isoSealSrc} x="555" y="995" width="130" height="130" preserveAspectRatio="xMidYMid meet" />

        {/* RIGHT ZONE: QR Code Block (Centered at x=990) */}
        <rect x="925" y="990" width="130" height="130" fill="#FFFFFF" stroke="#071F4A" strokeWidth="2" rx="4" />
        {qrSrc && <image href={qrSrc} xlinkHref={qrSrc} x="930" y="995" width="120" height="120" preserveAspectRatio="xMidYMid meet" />}
        <text x="990" y="1132" fill="#071F4A" fontFamily="'Inter', sans-serif" fontSize="14" fontWeight="800" textAnchor="middle">
          Scan to Verify Affiliation
        </text>
        <text x="990" y="1150" fill="#555555" fontFamily="'Inter', sans-serif" fontSize="12" textAnchor="middle">
          www.dkffj.org/verify
        </text>

        {/* 12. PROMINENT GOVERNMENT LOGOS BAND (y: 1270–1440, Natural Aspect Ratios) */}
        {/* MCA (45, 1285, 180x120) */}
        <image href={mcaSrc} xlinkHref={mcaSrc} x="45" y="1285" width="180" height="120" preserveAspectRatio="xMidYMid meet" />
        {/* NITI Aayog (270, 1305, 185x90) */}
        <image href={nitiSrc} xlinkHref={nitiSrc} x="270" y="1305" width="185" height="90" preserveAspectRatio="xMidYMid meet" />
        {/* NSDC (505, 1285, 225x120) */}
        <image href={nsdcSrc} xlinkHref={nsdcSrc} x="505" y="1285" width="225" height="120" preserveAspectRatio="xMidYMid meet" />
        {/* State Emblem (780, 1275, 190x140) */}
        <image href={emblemSrc} xlinkHref={emblemSrc} x="780" y="1275" width="190" height="140" preserveAspectRatio="xMidYMid meet" />
        {/* MSME (1015, 1305, 205x90) */}
        <image href={msmeSrc} xlinkHref={msmeSrc} x="1015" y="1305" width="205" height="90" preserveAspectRatio="xMidYMid meet" />

        {/* 13. SUBTLE DIVIDER & FOOTER ADDRESS BAR (Divider at 1475, Footer at 1515 & 1542) */}
        <line x1="200" y1="1475" x2="1040" y2="1475" stroke="#C89C38" strokeWidth="1.8" opacity="0.7" />
        <text x="620" y="1515" fill="#061D48" fontFamily="'Inter', sans-serif" fontSize="15.5" fontWeight="800" textAnchor="middle">
          Head Office: 117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP) India
        </text>
        <text x="620" y="1542" fill="#444444" fontFamily="'Inter', sans-serif" fontSize="14" fontWeight="600" textAnchor="middle">
          Website: www.dkffj.org   |   Email: contact@dkffj.org   |   Contact: +91 88712 19033, +91 70804 00333
        </text>
      </svg>
    </div>
  );
};

// Generates the PDF using html2canvas and jsPDF (A4 Portrait)
export async function generateAffiliationPDFClient(
  data: AffiliationCertificateData,
  photoBase64Input?: string,
  qrBase64Input?: string
): Promise<{ pdfBlob: Blob; pngBlob: Blob }> {
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const jspdfModule = await import("jspdf");
  const jsPDF = jspdfModule.default || jspdfModule.jsPDF || jspdfModule;

  const [
    photoBase64,
    qrBase64,
    logoBase64,
    mcaBase64,
    nitiBase64,
    nsdcBase64,
    msmeBase64,
    emblemBase64,
    isoSealBase64,
    signatureBase64,
    borderBase64
  ] = await Promise.all([
    photoBase64Input ? Promise.resolve(photoBase64Input) : (data.applicantPhotoUrl ? getBase64ImageFromUrl(data.applicantPhotoUrl) : Promise.resolve("")),
    qrBase64Input ? Promise.resolve(qrBase64Input) : (data.qrCodeUrl ? getBase64ImageFromUrl(data.qrCodeUrl) : Promise.resolve("")),
    getBase64ImageFromUrl("/logo.png"),
    getBase64ImageFromUrl("/images/mca.png"),
    getBase64ImageFromUrl("/images/niti_aayog.png"),
    getBase64ImageFromUrl("/images/nsdc.png"),
    getBase64ImageFromUrl("/images/msme.png"),
    getBase64ImageFromUrl("/images/ministry_of_social_justice.png"),
    getBase64ImageFromUrl("/images/iso.png"),
    getBase64ImageFromUrl("/images/director_sig.png"),
    getBase64ImageFromUrl("/images/affiliation-institutional-border-a4-landscape.svg")
  ]);

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.zIndex = "-9999";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  return new Promise(async (resolve, reject) => {
    try {
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);

      root.render(
        <AffiliationCertificateRenderer
          data={data}
          photoBase64={photoBase64}
          qrBase64={qrBase64}
          logoBase64={logoBase64}
          mcaBase64={mcaBase64}
          nitiBase64={nitiBase64}
          nsdcBase64={nsdcBase64}
          msmeBase64={msmeBase64}
          emblemBase64={emblemBase64}
          isoSealBase64={isoSealBase64}
          signatureBase64={signatureBase64}
          borderBase64={borderBase64}
        />
      );

      setTimeout(async () => {
        try {
          await document.fonts.ready;
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in container");
          }

          const canvas = await html2canvas(targetElement, {
            scale: 2.0, // High-resolution 300 DPI equivalent rendering (2480 x 3508)
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#F7EED7"
          });

          const pngBlob = await new Promise<Blob>((resBlob, rejBlob) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resBlob(blob);
              } else {
                rejBlob(new Error("Failed to generate PNG blob"));
              }
            }, "image/png");
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          // Sized for Portrait A4 layout (210mm x 297mm)
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
          const pdfBlob = pdf.output("blob");

          root.unmount();
          document.body.removeChild(container);

          resolve({ pdfBlob, pngBlob });
        } catch (err) {
          try {
            root.unmount();
            document.body.removeChild(container);
          } catch (_) {}
          reject(err);
        }
      }, 500);
    } catch (err) {
      reject(err);
    }
  });
}
