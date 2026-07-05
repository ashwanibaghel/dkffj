"use client";

import React from "react";
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

export interface GenerationResult {
  pdfBlob: Blob;
  pngBlob: Blob;
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
        padding: "20px",
        backgroundColor: "#f8fafc",
        display: "inline-block",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "1000px",
          height: "600px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          border: "3px solid #005b94", // ID Card Outer Border
          overflow: "hidden",
          backgroundColor: "#0076c0",
          color: "#ffffff",
          display: "flex",
          position: "relative",
          boxSizing: "border-box"
        }}
      >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}</style>

      {/* LEFT PANEL */}
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "20px 20px 0 20px",
          position: "relative",
          borderRight: "3px solid #005b94", // Thick divider matching border
          backgroundColor: "#0076c0",
          boxSizing: "border-box"
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "8px", fontFamily: "Arial, sans-serif" }}>IDENTITY CARD</div>
        
        <img
          style={{ width: "55px", height: "55px", marginBottom: "8px", objectFit: "contain" }}
          src={logoSrc}
          alt="Logo"
        />
        
        <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "0.5px", fontFamily: "Arial, sans-serif" }}>
          DK FOUNDATION OF FREEDOM AND JUSTICE
        </div>
        
        <div style={{ fontSize: "11px", fontWeight: "bold", color: "#e0f2fe", marginTop: "2px", fontFamily: "Arial, sans-serif" }}>
          HUMAN RIGHTS PROTECTION
        </div>
        
        <div style={{ fontSize: "8px", color: "#cbd5e1", marginBottom: "12px", fontFamily: "Arial, sans-serif" }}>
          Regd. By Ministry of Corporate affairs Govt. of India
        </div>
        
        <img
          style={{ width: "130px", height: "145px", border: "3px solid #ffffff", objectFit: "cover", marginBottom: "12px" }}
          src={photoSrc}
          alt={data.fullName}
        />
        
        <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "6px", fontFamily: "Arial, sans-serif" }}>
          {data.fullName}
        </div>
        
        <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "1px", marginBottom: "12px", fontFamily: "Arial, sans-serif" }}>
          {data.designation}
        </div>
        
        <div style={{ fontSize: "15px", marginBottom: "12px", fontFamily: "Arial, sans-serif" }}>
          Work Area: <strong>{data.workingArea}</strong>
        </div>
        
        <div style={{ fontSize: "15px", marginBottom: "12px", fontFamily: "Arial, sans-serif" }}>
          Valid Till : <strong>{data.validFromStr} to {data.validToStr}</strong>
        </div>
        
        <div style={{ fontSize: "15px", marginBottom: "12px", fontFamily: "Arial, sans-serif", lineHeight: "1.3" }}>
          Add: <strong>{data.addressStr}<br />{data.districtStr} {data.stateStr} {data.pincodeStr ? `- ${data.pincodeStr}` : ""}</strong>
        </div>
        
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", paddingRight: "40px", marginTop: "-5px" }}>
          <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: "24px", color: "#ffffff", transform: "rotate(-5deg)", display: "inline-block" }}>
            Wasim Qureshi
          </span>
        </div>
        
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#e11d48",
          color: "#ffffff",
          textAlign: "center",
          padding: "8px 10px",
          fontSize: "11px",
          lineHeight: "1.3",
          fontWeight: "bold",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box"
        }}>
          <span style={{ color: "#fef08a", display: "block", fontSize: "12px", marginBottom: "2px" }}>Head Office Address</span>
          117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP)
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: "50%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "25px",
          position: "relative",
          backgroundColor: "#0076c0",
          boxSizing: "border-box"
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "0.5px", textAlign: "center", marginBottom: "15px", fontFamily: "Arial, sans-serif", color: "#ffffff" }}>
          Regd. No.<br />
          U88900UP2023NPL185611
        </div>
        
        <img
          style={{ width: "165px", height: "165px", marginBottom: "15px", objectFit: "contain" }}
          src={logoSrc}
          alt="Large Logo"
        />
        
        <div style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "0.5px", marginBottom: "25px", fontFamily: "Arial, sans-serif", color: "#ffffff" }}>
          Mob. {data.mobileStr}
        </div>
        
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "185px", // Tall curved base dome
          backgroundColor: "#ffffff",
          borderTopLeftRadius: "50% 30px",
          borderTopRightRadius: "50% 30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#000000",
          paddingTop: "10px",
          boxSizing: "border-box"
        }}>
          {qrSrc && (
            <img
              style={{ width: "85px", height: "85px", marginBottom: "5px", objectFit: "contain" }}
              src={qrSrc}
              alt="QR Code"
            />
          )}
          <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px", fontFamily: "Arial, sans-serif" }}>
            ID NO.{data.membershipNo || data.ackNo}
          </div>
          <div style={{ fontSize: "15px", fontFamily: "Arial, sans-serif" }}>
            Website : <span style={{ fontWeight: "bold" }}>www.dkffj.org</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// Generates the Landscape ID Card PDF, returns the file blob
export async function generateMembershipIdCardPDFClient(
  data: MembershipIdCardData
): Promise<GenerationResult> {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

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
            backgroundColor: "#f8fafc"
          });

          // 1. Get PNG blob
          const pngBlob = await new Promise<Blob>((resBlob, rejBlob) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resBlob(blob);
              } else {
                rejBlob(new Error("Failed to generate PNG blob"));
              }
            }, "image/png");
          });

          // 2. Get PDF blob
          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4" // 297mm x 210mm
          });

          // Outer wrapper is 1040px wide by 640px high (Aspect ratio: 1.625)
          // Width on A4 Landscape is 273mm. Height scaled: 273 / 1.625 = 168mm.
          // Center: x = (297 - 273) / 2 = 12mm. y = (210 - 168) / 2 = 21mm.
          pdf.addImage(imgData, "JPEG", 12, 21, 273, 168, undefined, "FAST");
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
      }, 2200);
    } catch (err) {
      reject(err);
    }
  });
}
