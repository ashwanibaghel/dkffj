"use client";

import React from "react";
import { getBase64ImageFromUrl } from "../registrations/CertificateGenerator";
import { cleanAmpText } from "@/lib/sanitize";
import { resolveFullPhotoUrl } from "@/lib/photoUtils";

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
  validFromStr: string;
  validToStr: string;
  applicantFullName: string;
  applicantDesignation: string;
  applicantPhotoUrl?: string | null;
  qrCodeUrl?: string | null;
  verificationUrl?: string | null;
  approvedDomains?: string[];
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

  const rawPhoto = photoBase64 || (data.applicantPhotoUrl ? resolveFullPhotoUrl(data.applicantPhotoUrl) : "");
  const photoSrc = rawPhoto && (rawPhoto.startsWith("data:") || rawPhoto.startsWith("http://") || rawPhoto.startsWith("https://")) ? rawPhoto : "";
  const logoSrc = logoBase64 || "/logo.png";
  const mcaSrc = mcaBase64 || "/images/mca.png";
  const nitiSrc = nitiBase64 || "/images/niti_aayog.png";
  const nsdcSrc = nsdcBase64 || "/images/nsdc.png";
  const msmeSrc = msmeBase64 || "/images/msme.png";
  const emblemSrc = emblemBase64 || "/images/ministry_of_social_justice.png";
  const isoSealSrc = isoSealBase64 || "/images/iso.png";
  const signatureSrc = signatureBase64 || "/images/director_sig.png";
  const borderSrc = borderBase64 || "/images/affiliation-heritage-border-a4.svg";

  // Verification QR Code
  const cleanVerifyToken = data.verificationToken || data.id;
  let rawVerifyLink = data.verificationUrl || `https://www.dkffj.org/affiliation/verify/${cleanVerifyToken}`;
  rawVerifyLink = rawVerifyLink
    .replace(/https?:\/\/localhost:\d+/gi, "https://www.dkffj.org")
    .replace(/https?:\/\/[^/]*vercel\.app/gi, "https://www.dkffj.org");

  const computedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(rawVerifyLink)}`;
  const qrSrc = qrBase64 || data.qrCodeUrl || computedQrUrl;

  const cleanApplicantName = cleanAmpText(data.applicantFullName || "Authorized Member");
  const cleanOrgName = cleanAmpText(data.organizationName || "Partner Organization");
  const cleanDesignation = cleanAmpText(data.applicantDesignation || "Representative");
  const cleanOrgType = cleanAmpText(data.organizationType || "Social Welfare Organization");
  const cleanDistrict = cleanAmpText(data.district || "District");
  const cleanState = cleanAmpText(data.state || "State");

  return (
    <div
      id={`affiliation-certificate-render-container-${data.id || data.applicationNo}`}
      style={{
        width: "794px",  // Portrait A4 Width
        height: "1123px", // Portrait A4 Height
        position: "relative",
        backgroundColor: "#ffffff", // Clean crisp white background
        fontFamily: "'Playfair Display', Georgia, serif",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "35px",
        margin: "0 auto"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=Inter:wght@400;600;700;800;900&family=UnifrakturMaguntia&display=swap');
      `}</style>

      {/* 1. Repeating Background Security Text Watermark Pattern */}
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
          gap: "11px",
          padding: "20px 0",
          boxSizing: "border-box",
          opacity: 0.07,
          userSelect: "none"
        }}
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "9px",
              color: "#001C55",
              whiteSpace: "nowrap",
              letterSpacing: "1.8px",
              width: "100%",
              textAlign: "center"
            }}
          >
            {"DK FOUNDATION OF FREEDOM AND JUSTICE   ".repeat(4)}
          </div>
        ))}
      </div>

      {/* 2. Large Central Foundation Emblem Background Watermark */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "360px",
          height: "360px",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <img src={logoSrc} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* 3. A4 SVG Decorative Frame Border Background */}
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
          padding: "0 18px",
          boxSizing: "border-box"
        }}
      >
        {/* Top Header Block */}
        <div style={{ marginTop: "32px", textAlign: "center", width: "100%" }}>
          <h1
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontWeight: 800,
              fontSize: "24px",
              color: "#a21e1e",
              letterSpacing: "1.2px",
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
              color: "#111111",
              letterSpacing: "1.5px",
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
              fontSize: "12px",
              color: "#333333",
              margin: "3px 0 0 0"
            }}
          >
            Regd. By Ministry of Corporate affairs Govt. of India
          </p>
        </div>

        {/* Ref No & Date Row Bar */}
        <div
          style={{
            width: "92%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "12px",
            fontFamily: "'Playfair Display', serif"
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333333" }}>
            <span>Affiliation No: </span>
            <span style={{ color: "#a21e1e", fontFamily: "monospace", fontSize: "14.5px" }}>{formattedAffiliationNo}</span>
          </div>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333333" }}>
            <span>Date: </span>
            <span style={{ color: "#333333" }}>{data.validFromStr}</span>
          </div>
        </div>

        {/* Curved Title Arch with Centered DKFFJ Logo Nestled Beneath */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "185px",
            marginTop: "4px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {/* Curved SVG Arch Text: Certificate of Affiliation */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }}>
            <svg viewBox="0 0 700 185" width="100%" height="185" style={{ overflow: "visible" }}>
              <path id="text-curve-aff" d="M 60,150 A 440,440 0 0,1 640,150" fill="none" />
              <text
                fill="#001C55"
                style={{
                  fontSize: "48px",
                  fontFamily: "'UnifrakturMaguntia', 'Old English Text MT', serif",
                  fontWeight: 400,
                  letterSpacing: "0.15px"
                }}
              >
                <textPath href="#text-curve-aff" startOffset="50%" textAnchor="middle">
                  Certificate of Affiliation
                </textPath>
              </text>
            </svg>
          </div>

          {/* Centered DKFFJ Crest Logo Nestled Under Arch Curve */}
          <div style={{ position: "absolute", top: "72px", zIndex: 1 }}>
            <img
              src={logoSrc}
              alt="DKFFJ Logo"
              style={{ width: "124px", height: "124px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Middle Body Area (Left-Aligned Structured Rows like Demo 1) */}
        <div
          style={{
            width: "92%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            position: "relative",
            margin: "10px 0"
          }}
        >
          {/* Applicant Photo Frame (Top Right of Body) */}
          {photoSrc && (
            <div
              style={{
                position: "absolute",
                right: "0px",
                top: "0px",
                width: "110px",
                height: "135px",
                border: "2px solid #001C55",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                overflow: "hidden",
                borderRadius: "2px",
                zIndex: 5
              }}
            >
              <img src={photoSrc} alt="Applicant Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          {/* Certification Body Lines (Left Aligned with Right Margin for Photo) */}
          <div style={{ width: "100%", textAlign: "left" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "16px", color: "#222222", margin: "0 0 12px 0" }}>
              This is to officially certify that-
            </p>

            {/* Applicant Name Line */}
            <div style={{ margin: "10px 0", maxWidth: "560px" }}>
              <span style={{ fontSize: "15.5px", fontStyle: "italic", color: "#333333" }}>Mr. / Mrs. / Miss: </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: "bold",
                  fontSize: "20px",
                  color: "#001C55",
                  borderBottom: "1.5px solid #c5a880",
                  padding: "0 10px",
                  display: "inline-block"
                }}
              >
                {cleanApplicantName}
              </span>
            </div>

            {/* Organization Name Line */}
            <div style={{ margin: "10px 0", maxWidth: "560px" }}>
              <span style={{ fontSize: "15.5px", fontStyle: "italic", color: "#333333" }}>Name of Organisation: </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: "bold",
                  fontSize: "19px",
                  color: "#a21e1e",
                  borderBottom: "1.5px solid #c5a880",
                  padding: "0 10px",
                  display: "inline-block"
                }}
              >
                {cleanOrgName}
              </span>
            </div>

            {/* Affiliation Scope & Authorization Line */}
            <div style={{ margin: "10px 0" }}>
              <span style={{ fontSize: "15px", fontStyle: "italic", color: "#333333" }}>Affiliation Type & Scope: </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "bold",
                  fontSize: "14.5px",
                  color: "#111111",
                  borderBottom: "1.5px solid #c5a880",
                  padding: "0 8px",
                  display: "inline-block"
                }}
              >
                Institutional Training Affiliation ({cleanDistrict}, {cleanState})
              </span>
            </div>

            {/* Affiliation Grant Statement */}
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: "#222222", margin: "14px 0 8px 0", lineHeight: "1.6" }}>
              a <strong style={{ color: "#a21e1e" }}>Yearly Affiliation</strong> is hereby granted to your institution by the <strong>DK Foundation of Freedom and Justice</strong> with effect from{" "}
              <strong>{data.validFromStr}</strong> to <strong>{data.validToStr}</strong>.
            </p>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: "#333333", margin: "8px 0", lineHeight: "1.5", fontStyle: "italic" }}>
              You are authorized to conduct approved training programs and cooperate with national skill development initiatives under DKFFJ guidelines.
            </p>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#475569", margin: "8px 0 0 0", fontStyle: "italic", borderTop: "1px dashed #cbd5e1", paddingTop: "6px" }}>
              * Note: This affiliation is valid strictly for the courses/programs approved by DKFFJ and listed in the official verification record / Annexure-A.
            </p>
          </div>
        </div>

        {/* Bottom Signatures, ISO Seal & QR Code Section (Matching Appreciation Certificate Layout) */}
        <div
          style={{
            width: "92%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "12px"
          }}
        >
          {/* Signatory (Left Column) */}
          <div style={{ width: "230px", textAlign: "center", flexShrink: 0, position: "relative", paddingTop: "40px" }}>
            {signatureSrc && (
              <img
                src={signatureSrc}
                alt="CEO Signature"
                style={{
                  position: "absolute",
                  bottom: "35px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  height: "75px",
                  maxWidth: "170px",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  pointerEvents: "none"
                }}
              />
            )}
            <div style={{ borderTop: "1.5px solid #555555", width: "100%", margin: "5px 0" }} />
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: "10.5px", fontWeight: "bold", color: "#333333", margin: 0 }}>
              (Seal & Signature)
            </p>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: "11.5px", fontWeight: "bold", color: "#333333", margin: "2px 0 0 0" }}>
              CEO
            </p>
          </div>

          {/* Gold & Black ISO 9001 Seal (Center Column) */}
          <div style={{ width: "116px", height: "116px", marginTop: "-10px", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={isoSealSrc} alt="ISO 9001 Seal" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>

          {/* Verification QR Code (Right Column) */}
          <div style={{ width: "230px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <div
              style={{
                width: "96px",
                height: "96px",
                border: "1px solid #dcdcdc",
                padding: "4px",
                backgroundColor: "#ffffff",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {qrSrc && <img src={qrSrc} alt="Verification QR" style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />}
            </div>
          </div>
        </div>

        {/* Footer Government Logos Band (Bigger, prominent government logos matching Appreciation Certificate) */}
        <div
          style={{
            marginTop: "16px",
            width: "92%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <img src={mcaSrc} alt="Ministry of Corporate Affairs" style={{ height: "70px", maxWidth: "205px", objectFit: "contain" }} />
          <img src={nitiSrc} alt="NITI Aayog" style={{ height: "68px", maxWidth: "155px", objectFit: "contain" }} />
          <img src={nsdcSrc} alt="NSDC" style={{ height: "70px", maxWidth: "165px", objectFit: "contain" }} />
          <img src={emblemSrc} alt="Ministry of Social Justice and Empowerment" style={{ height: "72px", maxWidth: "145px", objectFit: "contain" }} />
          <img src={msmeSrc} alt="Ministry of MSME" style={{ height: "68px", maxWidth: "175px", objectFit: "contain" }} />
        </div>

        {/* Footer Head Office Address & Contact */}
        <div
          style={{
            marginTop: "12px",
            marginBottom: "10px",
            textAlign: "center",
            width: "100%",
            maxWidth: "640px",
            padding: "0 10px",
            boxSizing: "border-box"
          }}
        >
          <p
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "10.5px",
              fontWeight: "900",
              color: "#001C55",
              margin: 0,
              whiteSpace: "nowrap",
              lineHeight: "1.3",
              letterSpacing: "0.1px",
              wordSpacing: "0.2px"
            }}
          >
            Head Office Address : 117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP)
          </p>
          <p
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "10px",
              fontWeight: "bold",
              color: "#555555",
              margin: "2px 0 0 0",
              whiteSpace: "nowrap",
              letterSpacing: "0.2px"
            }}
          >
            Website : www.dkffj.org &nbsp;|&nbsp; Contact No.: +91 9871219033, +91 7080403333
          </p>
        </div>
      </div>
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

  const cleanVerifyToken = data.verificationToken || data.id;
  let rawVerifyLink = data.verificationUrl || `https://www.dkffj.org/affiliation/verify/${cleanVerifyToken}`;
  rawVerifyLink = rawVerifyLink
    .replace(/https?:\/\/localhost:\d+/gi, "https://www.dkffj.org")
    .replace(/https?:\/\/[^/]*vercel\.app/gi, "https://www.dkffj.org");

  const defaultQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(rawVerifyLink)}`;
  const targetQrUrl = data.qrCodeUrl || defaultQrUrl;

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
    qrBase64Input ? Promise.resolve(qrBase64Input) : getBase64ImageFromUrl(targetQrUrl),
    getBase64ImageFromUrl("/logo.png"),
    getBase64ImageFromUrl("/images/mca.png"),
    getBase64ImageFromUrl("/images/niti_aayog.png"),
    getBase64ImageFromUrl("/images/nsdc.png"),
    getBase64ImageFromUrl("/images/msme.png"),
    getBase64ImageFromUrl("/images/ministry_of_social_justice.png"),
    getBase64ImageFromUrl("/images/iso.png"),
    getBase64ImageFromUrl("/images/director_sig.png"),
    getBase64ImageFromUrl("/images/affiliation-heritage-border-a4.svg")
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "794px";
  container.style.height = "1123px";
  container.style.overflow = "hidden";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-99999";
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
            scale: 2.0,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#ffffff"
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

          const imgData = canvas.toDataURL("image/jpeg", 0.88);

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
