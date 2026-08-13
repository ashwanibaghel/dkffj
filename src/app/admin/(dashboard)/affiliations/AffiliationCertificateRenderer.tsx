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
  let orgFontSize = 46;
  let isMultiLineOrg = false;
  let orgLine1 = cleanOrgName;
  let orgLine2 = "";

  if (orgNameLength > 50) {
    isMultiLineOrg = true;
    orgFontSize = 36;
    const words = cleanOrgName.split(" ");
    const mid = Math.ceil(words.length / 2);
    orgLine1 = words.slice(0, mid).join(" ");
    orgLine2 = words.slice(mid).join(" ");
  } else if (orgNameLength > 35) {
    orgFontSize = 40;
  } else {
    orgFontSize = 46;
  }

  // Underline width calculation (max 820px in portrait canvas)
  const underlineWidth = Math.min(820, Math.max(380, (isMultiLineOrg ? Math.max(orgLine1.length, orgLine2.length) : orgNameLength) * (orgFontSize * 0.58)));
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

        {/* 2. Main Central Emblem Watermark (cx: 620, cy: 910, diameter: 760px, opacity: 0.048) */}
        <image
          href={logoSrc}
          xlinkHref={logoSrc}
          x="240"
          y="530"
          width="760"
          height="760"
          preserveAspectRatio="xMidYMid meet"
          opacity="0.048"
        />

        {/* 3. Header Section with SINGLE TOP-CENTER DKFFJ LOGO (165x165px, y=70) */}
        <image
          href={logoSrc}
          xlinkHref={logoSrc}
          x="537.5"
          y="70"
          width="165"
          height="165"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Main Organization Heading (620, 278, 42px Cinzel bold serif - 43px clear gap below logo!) */}
        <text
          x="620"
          y="278"
          fill="#7B151C"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="800"
          fontSize="42"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          DK FOUNDATION OF FREEDOM AND JUSTICE
        </text>

        {/* Human Rights Protection Subhead (620, 320) */}
        <text
          x="620"
          y="320"
          fill="#061D48"
          fontFamily="'Inter', Arial, sans-serif"
          fontWeight="900"
          fontSize="27"
          textAnchor="middle"
          letterSpacing="2"
        >
          HUMAN RIGHTS PROTECTION
        </text>

        {/* Registration Line (620, 352) */}
        <text
          x="620"
          y="352"
          fill="#222222"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="19"
          textAnchor="middle"
        >
          Regd. By Ministry of Corporate Affairs, Govt. of India
        </text>

        {/* Decorative Divider Under Header (cx: 620, y: 378) */}
        <line x1="220" y1="378" x2="540" y2="378" stroke="#C89C38" strokeWidth="2.5" />
        <line x1="700" y1="378" x2="1020" y2="378" stroke="#C89C38" strokeWidth="2.5" />
        <circle cx="620" cy="378" r="5" fill="#7B151C" />

        {/* 4. Affiliation Metadata Row (70 & 1170, 420) */}
        {/* Left: Affiliation No */}
        <text x="70" y="420" fontFamily="'Inter', sans-serif" fontSize="19" fontWeight="700" fill="#061D48">
          <tspan fill="#061D48">Affiliation No.:</tspan>
          <tspan fill="#7B151C" fontFamily="monospace" fontWeight="800" dx="12">{formattedAffiliationNo}</tspan>
        </text>

        {/* Right: Issue Date */}
        <text x="1170" y="420" fontFamily="'Inter', sans-serif" fontSize="19" fontWeight="700" fill="#061D48" textAnchor="end">
          <tspan fill="#061D48">Issue Date:</tspan>
          <tspan fill="#061D48" fontWeight="800" dx="12">{issueDate}</tspan>
        </text>

        {/* 5. Main Certificate Title (620, 505, 54px Cinzel - Positioned cleanly below header divider!) */}
        <text
          x="620"
          y="505"
          fill="#071F4A"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="900"
          fontSize="54"
          textAnchor="middle"
          letterSpacing="3.5"
        >
          CERTIFICATE OF AFFILIATION
        </text>

        {/* Subtitle & Gold Dividers (620, 558, 25px Cinzel) */}
        <line x1="200" y1="552" x2="330" y2="552" stroke="#C89C38" strokeWidth="2.2" />
        <text
          x="620"
          y="558"
          fill="#C89C38"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="800"
          fontSize="25"
          textAnchor="middle"
          letterSpacing="2.8"
        >
          INSTITUTIONAL TRAINING AFFILIATION
        </text>
        <line x1="910" y1="552" x2="1040" y2="552" stroke="#C89C38" strokeWidth="2.2" />

        {/* Small Flourish Beneath Subtitle (y: 585) */}
        <path d="M 580 585 Q 600 579 620 585 Q 640 591 660 585 Q 640 579 620 585 Q 600 591 580 585 Z" fill="#C89C38" opacity="0.9" />
        <circle cx="620" cy="585" r="3.5" fill="#7B151C" />

        {/* 6. Intro Line (620, 638) */}
        <text
          x="620"
          y="638"
          fill="#222222"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="24"
          textAnchor="middle"
        >
          This is to officially certify that
        </text>

        {/* 7. Hero Institute Name (Enlarged Font & Spacing) */}
        {!isMultiLineOrg ? (
          <>
            <text
              x="620"
              y="705"
              fill="#071F4A"
              fontFamily="'Cinzel', Georgia, serif"
              fontWeight="900"
              fontSize={orgFontSize}
              textAnchor="middle"
              letterSpacing="1"
            >
              {orgLine1}
            </text>
            <line x1={underlineX1} y1="732" x2={underlineX2} y2="732" stroke="#C89C38" strokeWidth="2.8" />
            <polygon points="620,727 627,732 620,737 613,732" fill="#C89C38" />
          </>
        ) : (
          <>
            <text
              x="620"
              y="692"
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
              y="736"
              fill="#071F4A"
              fontFamily="'Cinzel', Georgia, serif"
              fontWeight="900"
              fontSize={orgFontSize}
              textAnchor="middle"
              letterSpacing="1"
            >
              {orgLine2}
            </text>
            <line x1={underlineX1} y1="760" x2={underlineX2} y2="760" stroke="#C89C38" strokeWidth="2.8" />
            <polygon points="620,755 627,760 620,765 613,760" fill="#C89C38" />
          </>
        )}

        {/* 8. Representative + Location Row (620, 798) */}
        <text x="620" y="798" fontFamily="'Inter', sans-serif" fontSize="23" fontWeight="700" textAnchor="middle">
          <tspan fill="#555555" fontWeight="600">Represented by: </tspan>
          <tspan fill="#071F4A" fontWeight="800" dx="4">{cleanApplicantName}</tspan>
          <tspan fill="#C89C38" fontWeight="800" dx="18">   •   </tspan>
          <tspan fill="#555555" fontWeight="600" dx="18">Location: </tspan>
          <tspan fill="#111111" fontWeight="800" dx="4">{cleanDistrict}, {cleanState}</tspan>
        </text>

        {/* 9. Grant Statement (3 Controlled Lines with Generous Spacing) */}
        {/* Line 1 (620, 855) */}
        <text
          x="620"
          y="855"
          fill="#222222"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontWeight="600"
          fontSize="23"
          textAnchor="middle"
        >
          has been granted
        </text>

        {/* Line 2 (620, 908) */}
        <text
          x="620"
          y="908"
          fill="#8B1E24"
          fontFamily="'Cinzel', Georgia, serif"
          fontWeight="800"
          fontSize="34"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          Institutional Training Affiliation
        </text>

        {/* Line 3 (620, 955) */}
        <text
          x="620"
          y="955"
          fill="#071F4A"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="800"
          fontSize="26"
          textAnchor="middle"
        >
          by DK Foundation of Freedom and Justice.
        </text>

        {/* 10. Disclaimer Block (2 Controlled Lines) */}
        {/* Line 1 (620, 1002) */}
        <text
          x="620"
          y="1002"
          fill="#444444"
          fontFamily="'Inter', sans-serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="19.5"
          textAnchor="middle"
        >
          This affiliation is valid only for the courses/programs approved by DKFFJ
        </text>

        {/* Line 2 (620, 1028) */}
        <text
          x="620"
          y="1028"
          fill="#444444"
          fontFamily="'Inter', sans-serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="19.5"
          textAnchor="middle"
        >
          and listed in Annexure-A / the official verification record.
        </text>

        {/* 11. DEDICATED ENLARGED AUTHENTICATION ROW (Shifted DOWN to y: 1090–1282) */}
        {/* LEFT ZONE: CEO Signature (Centered at x=245) */}
        {signatureSrc && (
          <image href={signatureSrc} xlinkHref={signatureSrc} x="130" y="1090" width="230" height="80" preserveAspectRatio="xMidYMid meet" style={{ mixBlendMode: "multiply" }} />
        )}
        <line x1="115" y1="1174" x2="375" y2="1174" stroke="#111111" strokeWidth="2" />
        <text x="245" y="1196" fill="#111111" fontFamily="'Inter', sans-serif" fontSize="15" fontWeight="700" textAnchor="middle">
          (Seal &amp; Signature)
        </text>
        <text x="245" y="1220" fill="#071F4A" fontFamily="'Cinzel', Georgia, serif" fontSize="17.5" fontWeight="800" textAnchor="middle">
          CHIEF EXECUTIVE OFFICER
        </text>
        <text x="245" y="1240" fill="#555555" fontFamily="'Inter', sans-serif" fontSize="14" textAnchor="middle">
          DK Foundation of Freedom and Justice
        </text>

        {/* CENTER ZONE: ISO Seal (Centered at x=620, Enlarged 160x160px) */}
        <image href={isoSealSrc} xlinkHref={isoSealSrc} x="540" y="1095" width="160" height="160" preserveAspectRatio="xMidYMid meet" />

        {/* RIGHT ZONE: QR Code Block (Centered at x=995, Enlarged 160x160px) */}
        <rect x="915" y="1090" width="160" height="160" fill="#FFFFFF" stroke="#071F4A" strokeWidth="2" rx="4" />
        {qrSrc && <image href={qrSrc} xlinkHref={qrSrc} x="920" y="1095" width="150" height="150" preserveAspectRatio="xMidYMid meet" />}
        <text x="995" y="1262" fill="#071F4A" fontFamily="'Inter', sans-serif" fontSize="15.5" fontWeight="800" textAnchor="middle">
          Scan to Verify Affiliation
        </text>
        <text x="995" y="1282" fill="#555555" fontFamily="'Inter', sans-serif" fontSize="13.5" textAnchor="middle">
          www.dkffj.org/verify
        </text>

        {/* 12. PROMINENT INSTITUTIONAL GOVERNMENT LOGO BAND (Shifted CLOSE to Auth Row y: 1330–1510) */}
        {/* MCA (40, 1345, 210x140) */}
        <image href={mcaSrc} xlinkHref={mcaSrc} x="40" y="1345" width="210" height="140" preserveAspectRatio="xMidYMid meet" />
        {/* NITI Aayog (270, 1370, 200x102) */}
        <image href={nitiSrc} xlinkHref={nitiSrc} x="270" y="1370" width="200" height="102" preserveAspectRatio="xMidYMid meet" />
        {/* NSDC (495, 1345, 250x140) */}
        <image href={nsdcSrc} xlinkHref={nsdcSrc} x="495" y="1345" width="250" height="140" preserveAspectRatio="xMidYMid meet" />
        {/* State Emblem (770, 1330, 205x160) */}
        <image href={emblemSrc} xlinkHref={emblemSrc} x="770" y="1330" width="205" height="160" preserveAspectRatio="xMidYMid meet" />
        {/* MSME (1000, 1370, 230x102) */}
        <image href={msmeSrc} xlinkHref={msmeSrc} x="1000" y="1370" width="230" height="102" preserveAspectRatio="xMidYMid meet" />

        {/* 13. FOOTER ADDRESS BAR (Shifted DOWN to y: 1545 & y: 1590, 1622 - Perfect 36px margin above inner border!) */}
        <line x1="160" y1="1545" x2="1080" y2="1545" stroke="#C89C38" strokeWidth="1.8" opacity="0.75" />
        <text x="620" y="1590" fill="#061D48" fontFamily="'Inter', sans-serif" fontSize="18" fontWeight="800" textAnchor="middle">
          Head Office: 117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP) India
        </text>
        <text x="620" y="1622" fill="#444444" fontFamily="'Inter', sans-serif" fontSize="16" fontWeight="600" textAnchor="middle">
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
