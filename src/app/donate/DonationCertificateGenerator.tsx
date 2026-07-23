"use client";

import React from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getBase64ImageFromUrl } from "../admin/(dashboard)/registrations/CertificateGenerator";

// Interface for Donation Certificate Data
export interface DonationCertificateData {
  orderId: string;
  fullName: string;
  amount: string;
  purpose: string;
  issueDateStr: string;
  qrCodeUrl: string;
  verificationUrl: string;
}

interface DonationCertificateRendererProps {
  data: DonationCertificateData;
  qrBase64?: string;
  logoBase64?: string;
  mcaBase64?: string;
  nitiBase64?: string;
  nsdcBase64?: string;
  msmeBase64?: string;
  emblemBase64?: string;
  isoSealBase64?: string;
  signatureBase64?: string;
}

export const DonationCertificateRenderer: React.FC<DonationCertificateRendererProps> = ({
  data,
  qrBase64,
  logoBase64,
  mcaBase64,
  nitiBase64,
  nsdcBase64,
  msmeBase64,
  emblemBase64,
  isoSealBase64,
  signatureBase64
}) => {
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const logoSrc = logoBase64 || "/logo.png";
  const mcaSrc = mcaBase64 || "/images/mca.png";
  const nitiSrc = nitiBase64 || "/images/niti aayog.png";
  const nsdcSrc = nsdcBase64 || "/images/nsdc.png";
  const msmeSrc = msmeBase64 || "/images/msme.png";
  const emblemSrc = emblemBase64 || "/images/ministry of social justice and empowerment.png";
  const isoSealSrc = isoSealBase64 || "/images/iso.png";
  const signatureSrc = signatureBase64 || "/images/director_sig.png";

  return (
    <div
      id={`donation-certificate-render-container-${data.orderId}`}
      style={{
        width: "794px",
        height: "1123px",
        position: "relative",
        backgroundColor: "#fcf9f2", // Warm premium ivory background
        fontFamily: "'Playfair Display', Georgia, serif",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "35px"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700;800&family=UnifrakturMaguntia&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=Inter:wght@400;600;700&display=swap');
      `}</style>

      {/* Repeating security watermark pattern */}
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
          gap: "10px",
          padding: "20px 0",
          boxSizing: "border-box",
          opacity: 0.09,
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
              letterSpacing: "1.5px",
              width: "100%",
              textAlign: "center"
            }}
          >
            {"DK FOUNDATION OF FREEDOM AND JUSTICE   ".repeat(4)}
          </div>
        ))}
      </div>

      {/* Vector Certificate Border Frame */}
      <svg
        viewBox="0 0 794 1123"
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 3
        }}
      >
        {/* Outer gold border line */}
        <rect x="16" y="16" width="762" height="1091" fill="none" stroke="#c5a880" strokeWidth="5" />
        
        {/* Inner thin red border line */}
        <rect x="24" y="24" width="746" height="1075" fill="none" stroke="#a21e1e" strokeWidth="2" />
        
        {/* Gold dots border line */}
        <rect x="30" y="30" width="734" height="1063" fill="none" stroke="#c5a880" strokeWidth="1" strokeDasharray="3,6" />

        {/* Symmetrical Vector Corner Ornaments (Top Left) */}
        <g transform="translate(35, 35)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Top Right) */}
        <g transform="translate(759, 35) scale(-1, 1)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Bottom Left) */}
        <g transform="translate(35, 1088) scale(1, -1)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Bottom Right) */}
        <g transform="translate(759, 1088) scale(-1, -1)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
      </svg>

      {/* Certificate Content wrapper */}
      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Top Header (Fonts enlarged) */}
        <div style={{ marginTop: "28px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: "27px", // Increased from 24px
            color: "#a21e1e",
            letterSpacing: "1px",
            margin: 0
          }}>
            DK FOUNDATION OF FREEDOM AND JUSTICE
          </h1>
          <h2 style={{
            fontFamily: "'Inter', Arial, sans-serif",
            fontWeight: 800,
            fontSize: "15px",
            color: "#111111",
            letterSpacing: "0.8px",
            margin: "2px 0 0 0"
          }}>
            HUMAN RIGHTS PROTECTION
          </h2>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "14px", // Increased from 12px
            color: "#333333",
            margin: "2px 0 0 0"
          }}>
            (Under Section 8 of The Companies Act, 2013 Govt of India)
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "12px", // Increased from 10px
            color: "#555555",
            letterSpacing: "0.5px",
            margin: "3px 0 0 0"
          }}>
            CIN No. U88900UP2023NPL185611
          </p>
        </div>

        {/* Ref No & Date Pills (Fonts enlarged) */}
        <div style={{
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "18px",
          fontFamily: "'Playfair Display', serif"
        }}>
          <div style={{
            border: "1.5px solid #c5a880",
            borderRadius: "20px",
            padding: "4px 15px",
            backgroundColor: "#ffffff",
            fontSize: "13.5px", // Increased from 12px
            fontWeight: "bold",
            color: "#333333"
          }}>
            Ref No: <span style={{ color: "#a21e1e", fontFamily: "monospace" }}>{data.orderId}</span>
          </div>
          <div style={{
            border: "1.5px solid #c5a880",
            borderRadius: "20px",
            padding: "4px 15px",
            backgroundColor: "#ffffff",
            fontSize: "13.5px", // Increased from 12px
            fontWeight: "bold",
            color: "#333333"
          }}>
            Date: <span style={{ color: "#333333" }}>{data.issueDateStr}</span>
          </div>
        </div>

        {/* Curved Title & Crest Logo Area (Crest Logo enlarged) */}
        <div style={{
          position: "relative",
          width: "700px",
          height: "230px",
          marginTop: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {/* Curved Title SVG */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }}>
            <svg viewBox="0 0 700 230" width="700" height="230" style={{ overflow: "visible" }}>
              <path id="text-curve" d="M 60,185 A 440,440 0 0,1 640,185" fill="none" />
              <text fill="#001C55" style={{ fontSize: "54px", fontFamily: "'UnifrakturMaguntia', serif" }}>
                <textPath href="#text-curve" startOffset="50%" textAnchor="middle">
                  Certificate of Appreciation
                </textPath>
              </text>
            </svg>
          </div>

          {/* Crest Logo (Enlarged) */}
          <div style={{ position: "absolute", top: "100px", zIndex: 1 }}>
            <img
              src={logoSrc}
              alt="Crest Logo"
              style={{ width: "125px", height: "125px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* CSS for lines */}
        <style>{`
          .cert-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            border: none;
            border-bottom: 1.5px solid #c5a880;
            border-radius: 0;
            color: #111111;
            font-weight: bold;
            font-size: 19px;
            height: 28px;
            box-shadow: none;
            padding: 0 10px;
          }
          .cert-line {
            display: flex;
            align-items: center;
            width: 90%;
            margin-left: 5%;
            font-size: 17.5px;
            color: #222222;
            font-style: italic;
          }
        `}</style>

        {/* Form Fields (Dynamic Rows - Fonts increased to fill space) */}
        <div style={{ width: "100%", marginTop: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
          
          {/* Row 1: Donor Name */}
          <div className="cert-line">
            <span style={{ minWidth: "330px", fontSize: "17.5px", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>
              This certificate is proudly presented to Mr./Ms./Mrs.
            </span>
            <div className="cert-pill" style={{ flex: 1, textTransform: "uppercase" }}>
              {data.fullName}
            </div>
          </div>

          {/* Row 2: Contribution details */}
          <div style={{
            fontSize: "17.5px", // Increased from 15px
            fontStyle: "italic",
            fontFamily: "'Playfair Display', serif",
            color: "#222222",
            textAlign: "center",
            width: "90%",
            marginLeft: "5%",
            marginTop: "5px"
          }}>
            in heartfelt appreciation of their generous contribution and noble support towards
          </div>

          {/* Row 3: Purpose & Amount */}
          <div className="cert-line">
            <div className="cert-pill" style={{ flex: 1, textAlign: "center" }}>
              {data.purpose}
            </div>
            <span style={{ margin: "0 10px", fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>
              with an amount of
            </span>
            <div className="cert-pill" style={{ width: "150px", textAlign: "center" }}>
              ₹{Number(data.amount).toLocaleString("en-IN")}
            </div>
          </div>

          {/* Central Appreciation text paragraph */}
          <div style={{
            width: "90%",
            marginLeft: "5%",
            textAlign: "center",
            fontSize: "17.5px", // Increased from 15px
            fontStyle: "italic",
            color: "#222222",
            lineHeight: "1.8",
            marginTop: "15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px"
          }}>
            <p style={{ margin: 0 }}>
              Your act of kindness serves as an inspiration and strengthens our mission to promote
            </p>
            <p style={{ margin: 0 }}>
              education, human welfare, and justice for all. We extend our deepest gratitude
            </p>
            <p style={{ margin: 0, fontWeight: "600", fontFamily: "'Playfair Display', serif" }}>
              and wish you continued success and prosperity in all your endeavors.
            </p>
          </div>
        </div>

        {/* Signatures, Seal and QR Code Area (Shifted down and signature image rendered) */}
        <div style={{
          width: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "65px" // Shifted down from 45px
        }}>
          {/* Signatory (Left Column - Signature image and text) */}
          <div style={{ width: "230px", textAlign: "center", flexShrink: 0, position: "relative", paddingTop: "50px" }}>
            {signatureSrc && (
              <img
                src={signatureSrc}
                alt="Authorized Signature"
                style={{
                  position: "absolute",
                  bottom: "48px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  height: "65px", // Height set matching membership size
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  pointerEvents: "none"
                }}
              />
            )}
            <div style={{ borderTop: "1.5px solid #555555", width: "100%", margin: "5px 0" }} />
            <p style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "11px",
              fontWeight: "bold",
              color: "#333333",
              margin: 0
            }}>
              (Seal & Signature)
            </p>
            <p style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "10px",
              color: "#555555",
              margin: "2px 0 0 0"
            }}>
              Director / Authorized Signatory
            </p>
          </div>

          {/* ISO 9001 Seal (Center Column - Sizing increased) */}
          <div style={{ width: "125px", height: "150px", marginTop: "-30px", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src={isoSealSrc}
              alt="ISO 9001 Seal"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Verification QR Code (Right Column - Sizing increased) */}
          <div style={{ width: "230px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <div style={{
              width: "90px",
              height: "90px",
              border: "1px solid #cccccc",
              padding: "3px",
              backgroundColor: "#ffffff"
            }}>
              {qrSrc && (
                <img
                  src={qrSrc}
                  alt="Verification QR"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Logo Band (Shifted down) */}
        <div style={{
          marginTop: "65px", // Shifted down from 45px
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "transparent",
          border: "none",
          padding: "0"
        }}>
          {/* MCA Logo */}
          <img
            src={mcaSrc}
            alt="Ministry of Corporate Affairs"
            style={{ height: "60px", maxWidth: "175px", objectFit: "contain" }}
          />
          {/* NITI Aayog */}
          <img
            src={nitiSrc}
            alt="NITI Aayog"
            style={{ height: "58px", maxWidth: "115px", objectFit: "contain" }}
          />
          {/* NSDC */}
          <img
            src={nsdcSrc}
            alt="NSDC"
            style={{ height: "60px", maxWidth: "125px", objectFit: "contain" }}
          />
          {/* State Emblem of India */}
          <img
            src={emblemSrc}
            alt="Ministry of Social Justice and Empowerment"
            style={{ height: "62px", maxWidth: "105px", objectFit: "contain" }}
          />
          {/* MSME Logo */}
          <img
            src={msmeSrc}
            alt="Ministry of MSME"
            style={{ height: "58px", maxWidth: "135px", objectFit: "contain" }}
          />
        </div>

        {/* Verify Footer Link (Margin and line separation updated to completely resolve overlap) */}
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "11px", // Increased from 8.5px
            color: "#666666",
            margin: "0 0 8px 0", // Added bottom margin to resolve overlap
            lineHeight: "1.6"
          }}>
            An Internationally Approved Certification Body by UK Acknowledging Company Ltd.
          </p>
          <p style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "12px", // Increased from 9px
            fontWeight: "bold",
            color: "#a21e1e",
            margin: "0",
            letterSpacing: "0.2px",
            lineHeight: "1.6"
          }}>
            Verify this certificate online on www.dkffj.org
          </p>
        </div>

      </div>
    </div>
  );
};

// Generates the PDF using html2canvas and jsPDF, returns the file blob
export async function generateDonationPDFClient(
  data: DonationCertificateData
): Promise<Blob> {
  const qrBase64 = await getBase64ImageFromUrl(data.qrCodeUrl);

  // Pre-resolve all local branding assets to Base64 to bypass CORS & html2canvas SVG limitations
  const logoBase64 = await getBase64ImageFromUrl("/logo.png");
    const mcaBase64 = await getBase64ImageFromUrl("/images/mca.png");
    const nitiBase64 = await getBase64ImageFromUrl("/images/niti aayog.png");
  const nsdcBase64 = await getBase64ImageFromUrl("/images/nsdc.png");
  const msmeBase64 = await getBase64ImageFromUrl("/images/msme.png");
    const emblemBase64 = await getBase64ImageFromUrl("/images/ministry of social justice and empowerment.png");
    const isoSealBase64 = await getBase64ImageFromUrl("/images/iso.png");
  const signatureBase64 = await getBase64ImageFromUrl("/images/director_sig.png");

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.zIndex = "-9999";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  return new Promise(async (resolve, reject) => {
    try {
      const { createRoot } = (await import("react-dom/client"));
      const root = createRoot(container);

      root.render(
        <DonationCertificateRenderer
          data={data}
          qrBase64={qrBase64}
          logoBase64={logoBase64}
          mcaBase64={mcaBase64}
          nitiBase64={nitiBase64}
          nsdcBase64={nsdcBase64}
          msmeBase64={msmeBase64}
          emblemBase64={emblemBase64}
          isoSealBase64={isoSealBase64}
          signatureBase64={signatureBase64}
        />
      );

      // Wait 2 seconds to ensure custom web fonts and SVGs are fully parsed and rendered
      setTimeout(async () => {
        try {
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in offscreen container");
          }

          const canvas = await html2canvas(targetElement, {
            scale: 2.5, // Crisp resolution
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#fcf9f2"
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
          const pdfBlob = pdf.output("blob");

          root.unmount();
          document.body.removeChild(container);

          resolve(pdfBlob);
        } catch (err) {
          try {
            root.unmount();
            document.body.removeChild(container);
          } catch (_) {}
          reject(err);
        }
      }, 2000);
    } catch (err) {
      reject(err);
    }
  });
}
