"use client";

import React from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getBase64ImageFromUrl } from "../registrations/CertificateGenerator";

// Interface for ID Card Data
export interface MembershipIdCardData {
  membershipNo: string;
  ackNo: string;
  fullName: string;
  fatherName: string;
  designation: string;
  workingArea: string;
  photoUrl?: string | null;
  issueDateStr: string;
  validFromStr: string;
  validToStr: string;
  addressStr: string;
  districtStr: string;
  stateStr: string;
  pincodeStr: string;
  mobileStr: string;
  qrCodeUrl: string;
  verificationUrl: string;
}

interface MembershipIdCardRendererProps {
  data: MembershipIdCardData;
  photoBase64?: string;
  qrBase64?: string;
  logoBase64?: string;
}

export const MembershipIdCardRenderer: React.FC<MembershipIdCardRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  logoBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=300";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const logoSrc = logoBase64 || "/logo.png";

  return (
    <div
      id={`membership-idcard-render-container-${data.membershipNo || data.ackNo}`}
      style={{
        width: "962px",
        height: "600px",
        position: "relative",
        backgroundColor: "#f1f5f9",
        boxSizing: "border-box",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;600;700;800&family=Outfit:wght@500;600;700;800&family=Cinzel:wght@700;800&display=swap');
      `}</style>

      {/* ==================== LEFT CARD (FRONT SIDE) ==================== */}
      <div
        style={{
          width: "480px",
          height: "600px",
          position: "relative",
          backgroundColor: "#001C55", // Deep Logo Navy Blue
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "15px 20px"
        }}
      >
        {/* Header Title */}
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: "19px",
          color: "#ffffff",
          letterSpacing: "2.5px",
          margin: "0 0 8px 0",
          textTransform: "uppercase"
        }}>
          Identity Card
        </h3>

        {/* Circular Small Logo */}
        <div style={{
          width: "46px",
          height: "46px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          margin: "0 0 6px 0",
          overflow: "hidden"
        }}>
          <img
            src={logoSrc}
            alt="Logo Small"
            style={{ width: "42px", height: "42px", objectFit: "contain" }}
          />
        </div>

        {/* Organization Name */}
        <h2 style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 800,
          fontSize: "12px",
          color: "#ffffff",
          letterSpacing: "0.2px",
          textAlign: "center",
          margin: "0 0 2px 0",
          textTransform: "uppercase"
        }}>
          DK Foundation of Freedom and Justice
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: "9px",
          color: "#ffffff",
          letterSpacing: "1px",
          textAlign: "center",
          margin: "0 0 2px 0",
          textTransform: "uppercase"
        }}>
          Human Rights Protection
        </p>

        {/* Regd Notice */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "6.5px",
          color: "#dddddd",
          textAlign: "center",
          margin: "0 0 10px 0"
        }}>
          Regd. By Ministry of Corporate affairs Govt. of India
        </p>

        {/* Profile Photo Frame */}
        <div style={{
          width: "116px",
          height: "142px",
          borderRadius: "4px",
          border: "3.5px solid #c5a880", // Gold-yellow frame
          backgroundColor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          margin: "0 0 12px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img
            src={photoSrc}
            alt="Member Photo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Member Name */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: "18px",
          color: "#ffffff",
          textAlign: "center",
          margin: "0 0 4px 0",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {data.fullName}
        </h1>

        {/* Designation */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: "12px",
          color: "#ffffff",
          backgroundColor: "rgba(255,255,255,0.08)",
          padding: "3px 14px",
          borderRadius: "4px",
          textAlign: "center",
          margin: "0 0 10px 0",
          textTransform: "uppercase",
          letterSpacing: "1.5px"
        }}>
          {data.designation}
        </p>

        {/* Professional Specs: Work Area */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: "10px",
          color: "#ffffff",
          margin: "0 0 4px 0"
        }}>
          Work Area: <span style={{ color: "#c5a880" }}>{data.workingArea}</span>
        </p>

        {/* Validity Period */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "8.5px",
          color: "#dddddd",
          margin: "0 0 8px 0"
        }}>
          Valid Till : <span style={{ fontFamily: "monospace", fontSize: "9px" }}>{data.validFromStr} to {data.validToStr}</span>
        </p>

        {/* Residential Address Block */}
        <div style={{
          width: "90%",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
          fontSize: "8.5px",
          color: "#ffffff",
          lineHeight: "1.3",
          margin: "0 0 8px 0",
          opacity: 0.95
        }}>
          <span style={{ fontWeight: "bold" }}>Add:</span> {data.addressStr}
          <br />
          {data.districtStr}, {data.stateStr} {data.pincodeStr ? `- ${data.pincodeStr}` : ""}
        </div>

        {/* Digital Signature Overlay */}
        <div style={{
          position: "absolute",
          right: "35px",
          bottom: "54px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <span style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: "24px",
            color: "#ffffff",
            margin: "0",
            lineHeight: "1",
            transform: "rotate(-5deg)"
          }}>
            Wasim Qureshi
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "6px",
            color: "#c5a880",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginTop: "1px",
            borderTop: "0.5px solid rgba(255,255,255,0.3)",
            paddingTop: "2px",
            width: "70px"
          }}>
            Auth. Signatory
          </span>
        </div>

        {/* Footer Red Address Bar */}
        <div style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "#C00000", // Logo Red
          padding: "5px 15px",
          boxSizing: "border-box",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.15)"
        }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: "7.5px",
            color: "#ffffff",
            textTransform: "uppercase",
            margin: "0 0 1px 0",
            letterSpacing: "1px"
          }}>
            Head Office Address
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "7px",
            color: "#ffffff",
            margin: "0",
            lineHeight: "1.2",
            opacity: 0.95
          }}>
            117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP)
          </p>
        </div>
      </div>

      {/* ==================== CENTER DIVIDER LINE ==================== */}
      <div style={{
        width: "2px",
        height: "100%",
        backgroundColor: "#111111",
        zIndex: 5
      }} />

      {/* ==================== RIGHT CARD (BACK SIDE) ==================== */}
      <div
        style={{
          width: "480px",
          height: "600px",
          position: "relative",
          backgroundColor: "#001C55", // Logo Navy Blue
          boxSizing: "border-box",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "15px 20px"
        }}
      >
        {/* Upper Half Contents (Navy Background) */}
        <h4 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          color: "#ffffff",
          margin: "8px 0 2px 0",
          letterSpacing: "1.5px",
          textTransform: "uppercase"
        }}>
          Regd. No.
        </h4>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: "18px",
          color: "#ffffff",
          margin: "0 0 15px 0",
          letterSpacing: "0.5px"
        }}>
          U88900UP2023NPL185611
        </p>

        {/* Large Central Circular Crest Logo */}
        <div style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 0 18px 0",
          overflow: "hidden",
          border: "2px solid #ffffff",
          zIndex: 2
        }}>
          <img
            src={logoSrc}
            alt="Crest Logo Large"
            style={{ width: "172px", height: "172px", objectFit: "contain" }}
          />
        </div>

        {/* Contact Mobile */}
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: "17px",
          color: "#ffffff",
          margin: "0 0 10px 0",
          letterSpacing: "0.5px",
          zIndex: 2
        }}>
          Mob. {data.mobileStr}
        </h3>

        {/* Smooth Curved Wave SVG dividing Blue and White areas */}
        <svg
          viewBox="0 0 480 250"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "250px",
            zIndex: 1,
            pointerEvents: "none"
          }}
        >
          <path d="M 0,40 Q 240,95 480,40 L 480,250 L 0,250 Z" fill="#ffffff" />
        </svg>

        {/* Lower Half Contents (White Background Area - Z-index: 2 to sit on top of SVG) */}
        <div style={{
          position: "absolute",
          bottom: "18px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2
        }}>
          {/* Verification QR Code */}
          <div style={{
            width: "115px",
            height: "115px",
            border: "1.5px solid #e2e8f0",
            borderRadius: "6px",
            padding: "4px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            margin: "0 0 10px 0"
          }}>
            {qrSrc && (
              <img
                src={qrSrc}
                alt="Verification QR Code"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>

          {/* ID Number */}
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: "17px",
            color: "#0f172a",
            margin: "0 0 2px 0",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            ID NO. {data.membershipNo || data.ackNo}
          </h2>

          {/* Website Link */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "10.5px",
            color: "#475569",
            margin: "0"
          }}>
            Website : <span style={{ color: "#001C55" }}>www.dkffj.org</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Generates the Landscape ID Card PDF, returns the file blob
export async function generateMembershipIdCardPDFClient(
  data: MembershipIdCardData
): Promise<Blob> {
  let photoBase64 = "";
  if (data.photoUrl) {
    photoBase64 = await getBase64ImageFromUrl(data.photoUrl);
  }
  const qrBase64 = await getBase64ImageFromUrl(data.qrCodeUrl);
  const logoBase64 = await getBase64ImageFromUrl("/logo.png");

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
        <MembershipIdCardRenderer
          data={data}
          photoBase64={photoBase64}
          qrBase64={qrBase64}
          logoBase64={logoBase64}
        />
      );

      // Wait 2.2 seconds to ensure fonts, photos and QR SVGs are loaded and rendered
      setTimeout(async () => {
        try {
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in offscreen container");
          }

          const canvas = await html2canvas(targetElement, {
            scale: 2.5, // High resolution output
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#f1f5f9"
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          // CR80 is landscape ratio, so landscape A4 page fits perfectly side-by-side
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4" // 297mm x 210mm
          });

          // Container is 962px wide by 600px high (Aspect ratio: 1.603)
          // Width on A4 Landscape is 297mm. Height scaled: 297 / 1.603 = 185.2mm.
          // Center vertically: (210 - 185.2) / 2 = 12.4mm margins on top and bottom.
          pdf.addImage(imgData, "JPEG", 0, 12.4, 297, 185.2, undefined, "FAST");
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
      }, 2200);
    } catch (err) {
      reject(err);
    }
  });
}
