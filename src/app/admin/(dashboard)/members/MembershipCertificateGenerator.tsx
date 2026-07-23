"use client";

import React from "react";
import { getBase64ImageFromUrl } from "../registrations/CertificateGenerator";

// Interface for Membership Certificate Data
export interface MembershipCertificateData {
  membershipNo: string;
  ackNo: string;
  fullName: string;
  fatherName: string;
  designation: string;
  workingArea: string;
  photoUrl?: string | null;
  issueDateStr: string;
  qrCodeUrl: string;
  verificationUrl: string;
}

interface MembershipCertificateRendererProps {
  data: MembershipCertificateData;
  photoBase64?: string;
  qrBase64?: string;
  logoBase64?: string;
  signatureBase64?: string;
}

export const MembershipCertificateRenderer: React.FC<MembershipCertificateRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  logoBase64,
  signatureBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const logoSrc = logoBase64 || "/logo.png";
  const signatureSrc = signatureBase64 || "/images/director_sig.png";

  const certNumber = data.membershipNo || "1049";

  // Format date to "DD Mmm, YYYY" (e.g. 08 Oct, 2025)
  let formattedDate = data.issueDateStr;
  try {
    if (data.issueDateStr) {
      let dateObj: Date | null = null;
      if (data.issueDateStr.includes("/")) {
        const parts = data.issueDateStr.split("/");
        if (parts.length === 3) {
          dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      } else {
        dateObj = new Date(data.issueDateStr);
      }

      if (dateObj && !isNaN(dateObj.getTime())) {
        const day = dateObj.getDate().toString().padStart(2, '0');
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        formattedDate = `${day} ${month}, ${year}`;
      }
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }

  return (
    <div
      id={`membership-certificate-render-container-${data.membershipNo || data.ackNo}`}
      style={{
        width: "1123px", // Landscape A4 Width
        height: "794px",  // Landscape A4 Height
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        margin: "0 auto"
      }}
    >
      {/* 1. Subtle security watermark pattern (Opacity increased to 0.12, gap set to 12px for dense pattern) */}
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
          padding: "20px 0",
          boxSizing: "border-box",
          opacity: 0.12,
          userSelect: "none"
        }}
      >
        {Array.from({ length: 55 }).map((_, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "8.5px",
              color: "#001C55",
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

      {/* 2. Large Central Watermark Logo (Opacity increased to 0.10) */}
      <div
        style={{
          position: "absolute",
          left: "401px", // (1123 - 320) / 2
          top: "237px",  // (794 - 320) / 2
          width: "320px",
          height: "320px",
          opacity: 0.10,
          pointerEvents: "none",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          userSelect: "none"
        }}
      >
        <img
          src={logoSrc}
          alt="Watermark Logo"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* 3. Elegant Vector Certificate Border Frame */}
      <svg
        viewBox="0 0 1123 794"
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
        {/* Outer navy border line */}
        <rect x="16" y="16" width="1091" height="762" fill="none" stroke="#001C55" strokeWidth="5.5" />
        
        {/* Inner thin red border line */}
        <rect x="25" y="25" width="1073" height="744" fill="none" stroke="#a21e1e" strokeWidth="1.8" />
        
        {/* Gold dots border line */}
        <rect x="31" y="31" width="1061" height="732" fill="none" stroke="#c5a880" strokeWidth="0.8" strokeDasharray="3,5" />

        {/* Corner Ornaments (Top Left) */}
        <g transform="translate(35, 35)">
          <path d="M 0 0 L 45 0 L 45 5 L 5 5 L 5 45 L 0 45 Z" fill="#a21e1e" />
          <path d="M 8 8 L 30 8 L 30 11 L 11 11 L 11 30 L 8 30 Z" fill="#c5a880" />
          <circle cx="4" cy="4" r="2" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Top Right) */}
        <g transform="translate(1088, 35) scale(-1, 1)">
          <path d="M 0 0 L 45 0 L 45 5 L 5 5 L 5 45 L 0 45 Z" fill="#a21e1e" />
          <path d="M 8 8 L 30 8 L 30 11 L 11 11 L 11 30 L 8 30 Z" fill="#c5a880" />
          <circle cx="4" cy="4" r="2" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Bottom Left) */}
        <g transform="translate(35, 759) scale(1, -1)">
          <path d="M 0 0 L 45 0 L 45 5 L 5 5 L 5 45 L 0 45 Z" fill="#a21e1e" />
          <path d="M 8 8 L 30 8 L 30 11 L 11 11 L 11 30 L 8 30 Z" fill="#c5a880" />
          <circle cx="4" cy="4" r="2" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Bottom Right) */}
        <g transform="translate(1088, 759) scale(-1, -1)">
          <path d="M 0 0 L 45 0 L 45 5 L 5 5 L 5 45 L 0 45 Z" fill="#a21e1e" />
          <path d="M 8 8 L 30 8 L 30 11 L 11 11 L 11 30 L 8 30 Z" fill="#c5a880" />
          <circle cx="4" cy="4" r="2" fill="#c5a880" />
        </g>
      </svg>

      {/* 4. Member Photo (top-left) */}
      {photoSrc && (
        <div
          style={{
            position: "absolute",
            left: "65px",
            top: "65px",
            width: "110px",
            height: "135px",
            overflow: "hidden",
            border: "1.8px solid #001C55",
            backgroundColor: "#ffffff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            zIndex: 4
          }}
        >
          <img
            src={photoSrc}
            alt="Member Photo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        </div>
      )}

      {/* 5. Larger Crest Logo (centered at top) */}
      <div
        style={{
          position: "absolute",
          left: "491px", // Centered: (1123 - 140) / 2
          top: "42px",
          width: "140px",
          height: "140px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 4
        }}
      >
        <img
          src={logoSrc}
          alt="Crest Logo"
          style={{ width: "130px", height: "130px", objectFit: "contain" }}
        />
      </div>

      {/* 6. Regd details and Certificate Number (top-right, right-aligned) */}
      <div
        style={{
          position: "absolute",
          right: "65px",
          top: "65px",
          textAlign: "right",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px", // Increased from 16px
          fontWeight: "bold",
          color: "#000000",
          lineHeight: "1.6",
          zIndex: 4
        }}
      >
        <p style={{ margin: 0 }}>Regd. No.: U88900UP2023NPL185611</p>
        <p style={{ margin: "2px 0 0 0" }}>
          Certificates No.: <span style={{ fontFamily: "monospace", fontSize: "20px", color: "#a21e1e" }}>{certNumber}</span>
        </p>
      </div>

      {/* 7. Central Titles Block */}
      <div
        style={{
          position: "absolute",
          left: "0px",
          top: "180px", // Moved up slightly to accommodate larger fonts
          width: "1123px",
          textAlign: "center",
          zIndex: 4
        }}
      >
        <h1 style={{
          fontFamily: "'Georgia', serif",
          fontWeight: "bold",
          fontSize: "36px", // Increased from 31px
          color: "#a21e1e",
          letterSpacing: "1px",
          margin: 0
        }}>
          DK FOUNDATION OF FREEDOM AND JUSTICE
        </h1>
        <h2 style={{
          fontFamily: "'Arial', sans-serif",
          fontWeight: "bold",
          fontSize: "24px", // Increased from 20px
          color: "#000000",
          letterSpacing: "0.5px",
          margin: "6px 0 0 0"
        }}>
          HUMAN RIGHTS PROTECTION
        </h2>
        <p style={{
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
          fontSize: "18px", // Increased from 15px
          color: "#000000",
          margin: "4px 0 0 0"
        }}>
          Regd. By Ministry of Corporate affairs Govt. of India
        </p>
      </div>

      {/* 8. Award sentence */}
      <div
        style={{
          position: "absolute",
          left: "0px",
          top: "308px",
          width: "1123px",
          textAlign: "center",
          fontFamily: "'Georgia', serif",
          fontWeight: "bold",
          fontStyle: "italic",
          fontSize: "21px", // Increased from 18px
          color: "#001C55",
          letterSpacing: "0.5px",
          zIndex: 4
        }}
      >
        THIS CERTIFICATE IS AWARDED TO
      </div>

      {/* 9. Member Name Block */}
      <div
        style={{
          position: "absolute",
          left: "120px",
          top: "348px",
          width: "883px",
          textAlign: "center",
          zIndex: 4
        }}
      >
        <span style={{
          fontFamily: "'Arial', sans-serif",
          fontWeight: "bold",
          fontSize: "38px", // Increased from 32px
          color: "#000000",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          backgroundColor: "transparent",
          padding: "0",
          position: "relative",
          zIndex: 2
        }}>
          {data.fullName}
        </span>
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-6px",
          borderBottom: "1.5px dotted #999999",
          zIndex: 1
        }} />
      </div>

      {/* 10. Human Rights Pledge Block */}
      <div
        style={{
          position: "absolute",
          left: "70px",
          width: "983px",
          top: "415px",
          textAlign: "center",
          fontSize: "19px", // Increased from 16.5px
          fontStyle: "italic",
          fontWeight: "bold", // Set to bold for optimal readability over watermark
          fontFamily: "'Georgia', serif",
          color: "#000000",
          lineHeight: "1.8",
          zIndex: 4
        }}
      >
        Has Solemnly Pledged To Protect And Promote Human Rights Of All Social Activities, At All Times, Without Any Discrimination And Has Also Pledged Not To Violate The Human Rights Of Others, Directly Or Indirectly, Through His/her Actions, Words Or Deeds.
      </div>

      {/* 11. Bottom Row: Dated */}
      <div
        style={{
          position: "absolute",
          left: "80px",
          top: "602px",
          width: "240px",
          zIndex: 4
        }}
      >
        <span style={{
          fontFamily: "'Georgia', serif",
          fontWeight: "bold",
          fontSize: "18px", // Increased from 15px
          color: "#000000",
          backgroundColor: "transparent",
          paddingRight: "0",
          position: "relative",
          zIndex: 2
        }}>
          Dated: <span style={{ fontFamily: "Arial, sans-serif", fontSize: "18px", fontWeight: "bold" }}>{formattedDate}</span>
        </span>
        <div style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-4px",
          borderBottom: "1.5px dotted #999999",
          zIndex: 1
        }} />
      </div>

      {/* 12. Bottom Row: Center QR Code */}
      {qrSrc && (
        <div
          style={{
            position: "absolute",
            left: "519px",
            top: "585px",
            width: "85px",
            height: "85px",
            padding: "3px",
            backgroundColor: "#ffffff",
            border: "1px solid #cccccc",
            boxSizing: "border-box",
            zIndex: 4
          }}
        >
          <img
            src={qrSrc}
            alt="Verification QR Code"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        </div>
      )}

      {/* 13. Bottom Row: Right Signature Block */}
      <div
        style={{
          position: "absolute",
          right: "80px",
          top: "535px",
          width: "240px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 4
        }}
      >
        {signatureSrc && (
          <img
            src={signatureSrc}
            alt="Authorized Signature"
            style={{
              height: "68px",
              objectFit: "contain",
              mixBlendMode: "multiply",
              marginBottom: "3px"
            }}
          />
        )}
        <div style={{ width: "100%", borderTop: "1.2px solid #555555", margin: "2px 0" }} />
        <p style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "14px", // Increased from 12px
          fontWeight: "bold",
          color: "#333333",
          margin: 0,
          textAlign: "center"
        }}>
          (Seal & Signature)
        </p>
        <p style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "13px",
          fontWeight: "bold",
          color: "#333333",
          margin: "2px 0 0 0",
          textAlign: "center"
        }}>
          CEO
        </p>
      </div>

      {/* 14. Footer Divider Line */}
      <div
        style={{
          position: "absolute",
          left: "60px",
          right: "60px",
          top: "708px",
          borderTop: "2px solid #a21e1e",
          zIndex: 4
        }}
      />

      {/* 15. Footer details */}
      <div
        style={{
          position: "absolute",
          left: "0px",
          top: "716px",
          width: "1123px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          zIndex: 4
        }}
      >
        <p style={{
          fontSize: "14.5px", // Increased from 12px
          fontWeight: "bold",
          color: "#001C55",
          margin: 0
        }}>
          Head Office Address : 117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP)
        </p>
        <p style={{
          fontSize: "13px",
          fontWeight: "bold",
          color: "#555555",
          margin: "5px 0 0 0",
          whiteSpace: "nowrap",
          letterSpacing: "0.2px"
        }}>
          Website : www.dkffj.org &nbsp;|&nbsp; Contact No.: +91 9871219033, +91 7080403333
        </p>
      </div>
    </div>
  );
};

// Generates the PDF using html2canvas and jsPDF, returns the file blob and png blob
export async function generateMembershipPDFClient(
  data: MembershipCertificateData,
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
    signatureBase64
  ] = await Promise.all([
    photoBase64Input ? Promise.resolve(photoBase64Input) : (data.photoUrl ? getBase64ImageFromUrl(data.photoUrl) : Promise.resolve("")),
    qrBase64Input ? Promise.resolve(qrBase64Input) : getBase64ImageFromUrl(data.qrCodeUrl),
    getBase64ImageFromUrl("/logo.png"),
    getBase64ImageFromUrl("/images/director_sig.png")
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
      const { createRoot } = (await import("react-dom/client"));
      const root = createRoot(container);

      root.render(
        <MembershipCertificateRenderer
          data={data}
          photoBase64={photoBase64}
          qrBase64={qrBase64}
          logoBase64={logoBase64}
          signatureBase64={signatureBase64}
        />
      );

      // Wait 1.5 seconds to ensure canvas assets are fully parsed and rendered
      setTimeout(async () => {
        try {
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in offscreen container");
          }

          const canvas = await html2canvas(targetElement, {
            scale: 2.0, // Crisp high-resolution render
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

          const imgData = canvas.toDataURL("image/jpeg", 0.85);

          // Sized for landscape A4 layout
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
