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
  const cleanOrgName = cleanAmpText(data.organizationName || "Partner Organization");
  const cleanDistrict = cleanAmpText(data.district || "District");
  const cleanState = cleanAmpText(data.state || "State");

  return (
    <div
      id={`affiliation-certificate-render-container-${data.id || data.applicationNo}`}
      style={{
        width: "1123px", // Landscape A4 Width
        height: "794px",  // Landscape A4 Height
        position: "relative",
        backgroundColor: "#F4EBD3", // Warm Cream / Parchment Ivory Base
        backgroundImage: "radial-gradient(ellipse at center, #FAF5E8 0%, #F4EBD3 70%, #EEDFB8 100%)", // Rich Parchment Depth
        fontFamily: "'Playfair Display', Georgia, serif",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "25px 38px",
        margin: "0 auto"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,500;1,600;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      {/* 1. Subtle Repeating Security Text Watermark Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "15px 0",
          boxSizing: "border-box",
          opacity: 0.035, // 3.5% opacity - subtle security background pattern
          userSelect: "none"
        }}
      >
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "8.5px",
              color: "#0B2A5B",
              whiteSpace: "nowrap",
              letterSpacing: "2px",
              width: "100%",
              textAlign: "center"
            }}
          >
            {"DK FOUNDATION OF FREEDOM AND JUSTICE   ".repeat(5)}
          </div>
        ))}
      </div>

      {/* 2. Large Central Foundation Emblem Watermark (Prominent 8% opacity) */}
      <div
        style={{
          position: "absolute",
          top: "49%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "450px", // Large 450px visual diameter
          height: "450px",
          opacity: 0.08, // 8% opacity - clearly visible watermark, zero text interference
          pointerEvents: "none",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <img src={logoSrc} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* 3. A4 Landscape Institutional Multi-layer SVG Frame Border */}
      <img
        src={borderSrc}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      {/* Main Certificate Content Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 22px",
          boxSizing: "border-box"
        }}
      >
        {/* Top Header Block */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          {/* Left Emblem Logo */}
          <div style={{ width: "75px" }}>
            <img src={logoSrc} alt="DKFFJ Logo" style={{ width: "68px", height: "68px", objectFit: "contain" }} />
          </div>

          {/* Center Foundation Header Title */}
          <div style={{ textAlign: "center", flex: 1, padding: "0 10px" }}>
            <h1
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontWeight: 900,
                fontSize: "26px",
                color: "#8B1E24", // Deep Maroon
                letterSpacing: "1.5px",
                margin: 0,
                lineHeight: "1.2",
                textTransform: "uppercase"
              }}
            >
              DK FOUNDATION OF FREEDOM AND JUSTICE
            </h1>
            <h2
              style={{
                fontFamily: "'Inter', Arial, sans-serif",
                fontWeight: 900,
                fontSize: "14px",
                color: "#0B2A5B", // Deep Navy
                letterSpacing: "2.2px",
                margin: "3px 0 0 0",
                textTransform: "uppercase"
              }}
            >
              HUMAN RIGHTS PROTECTION
            </h2>
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: "12px",
                color: "#444444",
                margin: "2px 0 0 0"
              }}
            >
              Regd. By Ministry of Corporate Affairs, Govt. of India
            </p>
          </div>

          {/* Right Emblem Logo for Visual Balance */}
          <div style={{ width: "75px", display: "flex", justifyContent: "flex-end" }}>
            <img src={logoSrc} alt="DKFFJ Seal" style={{ width: "68px", height: "68px", objectFit: "contain", opacity: 0.95 }} />
          </div>
        </div>

        {/* Metallic Gold Separator Line */}
        <div
          style={{
            width: "93%",
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, #C9A14A 20%, #0B2A5B 50%, #C9A14A 80%, transparent 100%)",
            margin: "8px 0"
          }}
        />

        {/* Metadata Row: Affiliation No (Left) | Issue Date (Right) */}
        <div
          style={{
            width: "93%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13.5px",
            fontWeight: 700,
            marginBottom: "4px"
          }}
        >
          <div style={{ color: "#0B2A5B" }}>
            <span>Affiliation No.: </span>
            <span style={{ color: "#8B1E24", fontFamily: "monospace", fontSize: "14.5px", fontWeight: 800 }}>{formattedAffiliationNo}</span>
          </div>
          <div style={{ color: "#0B2A5B" }}>
            <span>Issue Date: </span>
            <span style={{ color: "#111111", fontWeight: 800 }}>{issueDate}</span>
          </div>
        </div>

        {/* Main Title Section (Clean Centered Title) */}
        <div style={{ textAlign: "center", margin: "2px 0 8px 0" }}>
          <h2
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontWeight: 900,
              fontSize: "31px",
              color: "#0B2A5B", // Deep Navy
              letterSpacing: "3.5px",
              margin: 0,
              textTransform: "uppercase"
            }}
          >
            CERTIFICATE OF AFFILIATION
          </h2>
          <h3
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontWeight: 800,
              fontSize: "14px",
              color: "#C9A14A", // Antique Gold
              letterSpacing: "2px",
              margin: "3px 0 0 0",
              textTransform: "uppercase"
            }}
          >
            INSTITUTIONAL TRAINING AFFILIATION
          </h3>
        </div>

        {/* Institute-First Content Hierarchy Area (Bolder & Larger Text to Fill Canvas Richly) */}
        <div
          style={{
            width: "93%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
          }}
        >
          {/* Intro Line */}
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "17px",
              color: "#333333",
              margin: "0 0 6px 0"
            }}
          >
            This is to officially certify that
          </p>

          {/* Primary Institute Name (Hero Element in Body!) */}
          <div style={{ margin: "4px 0 10px 0" }}>
            <div
              style={{
                fontFamily: "'Cinzel', Georgia, serif",
                fontWeight: 900,
                fontSize: "27px",
                color: "#0B2A5B", // Deep Navy
                borderBottom: "2.5px solid #C9A14A", // Antique Gold Underline
                paddingBottom: "4px",
                display: "inline-block",
                letterSpacing: "1.2px"
              }}
            >
              {cleanOrgName.toUpperCase()}
            </div>
          </div>

          {/* Representative & Location Line */}
          <div style={{ margin: "4px 0 10px 0", lineHeight: "1.6" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", color: "#111111", margin: 0, fontWeight: 600 }}>
              <span style={{ color: "#555555" }}>Represented by: </span>
              <strong style={{ color: "#0B2A5B", fontWeight: 800 }}>{cleanApplicantName}</strong>
              <span style={{ margin: "0 12px", color: "#C9A14A", fontWeight: "bold" }}>•</span>
              <span style={{ color: "#555555" }}>Location: </span>
              <strong style={{ color: "#111111", fontWeight: 800 }}>{cleanDistrict}, {cleanState}</strong>
            </p>
          </div>

          {/* Affiliation Grant Sentence */}
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "16.5px",
              fontWeight: 700,
              color: "#111111",
              margin: "6px 0 10px 0",
              lineHeight: "1.6"
            }}
          >
            has been granted <strong style={{ color: "#8B1E24", fontWeight: 800 }}>Institutional Training Affiliation</strong> by{" "}
            <strong style={{ color: "#0B2A5B", fontWeight: 800 }}>DK Foundation of Freedom and Justice</strong>.
          </p>

          {/* Official Authorization Disclaimer */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11.5px",
              fontStyle: "italic",
              fontWeight: 600,
              color: "#444444",
              margin: "6px 0 0 0",
              maxWidth: "880px",
              lineHeight: "1.45"
            }}
          >
            This affiliation is valid only for the courses/programs approved by DKFFJ and listed in Annexure-A / the official verification record.
          </p>
        </div>

        {/* Symmetrical 3-Zone Signature, Seal & QR Area */}
        <div
          style={{
            width: "93%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "10px",
            marginBottom: "6px"
          }}
        >
          {/* LEFT ZONE: Authorized Signatory */}
          <div style={{ width: "240px", textAlign: "center", flexShrink: 0, position: "relative" }}>
            <div style={{ height: "48px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "2px" }}>
              {signatureSrc && (
                <img
                  src={signatureSrc}
                  alt="CEO Signature"
                  style={{
                    maxHeight: "46px",
                    maxWidth: "160px",
                    objectFit: "contain",
                    mixBlendMode: "multiply"
                  }}
                />
              )}
            </div>
            <div style={{ borderTop: "1.5px solid #0B2A5B", width: "100%", margin: "3px 0" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10.5px", fontWeight: 800, color: "#111111", margin: 0 }}>
              (Seal & Signature)
            </p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "12px", fontWeight: 800, color: "#0B2A5B", margin: "2px 0 0 0" }}>
              Chief Executive Officer
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 600, color: "#555555", margin: "1px 0 0 0" }}>
              DK Foundation of Freedom and Justice
            </p>
          </div>

          {/* CENTER ZONE: Official DKFFJ Gold ISO 9001 Seal */}
          <div style={{ width: "120px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={isoSealSrc} alt="ISO 9001 Seal" style={{ height: "88px", objectFit: "contain" }} />
          </div>

          {/* RIGHT ZONE: QR Verification Box */}
          <div style={{ width: "240px", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div
              style={{
                width: "82px",
                height: "82px",
                border: "1.5px solid #0B2A5B",
                padding: "3px",
                backgroundColor: "#ffffff",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
              }}
            >
              {qrSrc && <img src={qrSrc} alt="Verification QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "9.5px", color: "#0B2A5B", margin: "3px 0 0 0" }}>
              Scan to Verify Affiliation
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", fontWeight: 600, color: "#555555", margin: 0 }}>
              www.dkffj.org/verify
            </p>
          </div>
        </div>

        {/* Government / Official Logos Band (Slightly Larger Size & Common Baseline) */}
        <div
          style={{
            marginTop: "6px",
            width: "93%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 0"
          }}
        >
          <img src={mcaSrc} alt="Ministry of Corporate Affairs" style={{ height: "62px", maxWidth: "190px", objectFit: "contain" }} />
          <img src={nitiSrc} alt="NITI Aayog" style={{ height: "58px", maxWidth: "145px", objectFit: "contain" }} />
          <img src={nsdcSrc} alt="NSDC" style={{ height: "62px", maxWidth: "155px", objectFit: "contain" }} />
          <img src={emblemSrc} alt="Ministry of Social Justice and Empowerment" style={{ height: "64px", maxWidth: "140px", objectFit: "contain" }} />
          <img src={msmeSrc} alt="Ministry of MSME" style={{ height: "58px", maxWidth: "165px", objectFit: "contain" }} />
        </div>

        {/* Footer Head Office Address & Contact (Lifted Up Clear of Bottom Border Frame) */}
        <div
          style={{
            marginTop: "6px",
            marginBottom: "16px", // Lifted up to give ample breathing room clear of bottom border frame
            textAlign: "center",
            width: "100%",
            maxWidth: "780px",
            padding: "0 10px",
            boxSizing: "border-box"
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 800,
              color: "#0B2A5B",
              margin: 0,
              whiteSpace: "nowrap",
              letterSpacing: "0.2px"
            }}
          >
            Head Office: 117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP) India
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9.5px",
              fontWeight: 700,
              color: "#444444",
              margin: "2px 0 0 0",
              whiteSpace: "nowrap",
              letterSpacing: "0.2px"
            }}
          >
            Website: www.dkffj.org &nbsp;|&nbsp; Email: contact@dkffj.org &nbsp;|&nbsp; Contact: +91 9871219033, +91 7080403333
          </p>
        </div>
      </div>
    </div>
  );
};

// Generates the PDF using html2canvas and jsPDF (A4 Landscape)
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
            scale: 2.0, // High-resolution render (300 DPI equivalent)
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#F4EBD3"
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

          const imgData = canvas.toDataURL("image/jpeg", 0.92);

          // Sized for Landscape A4 layout (297mm x 210mm)
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
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
