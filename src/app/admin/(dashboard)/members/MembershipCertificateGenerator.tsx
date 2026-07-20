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
  templateBase64?: string;
  signatureBase64?: string;
}

export const MembershipCertificateRenderer: React.FC<MembershipCertificateRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  templateBase64,
  signatureBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const templateSrc = templateBase64 || "/images/membership_template.jpg";
  const signatureSrc = signatureBase64 || "/images/director_sig.png";

  // In PHP code, $row->id_no is printed as the Certificates No.
  const certNumber = data.membershipNo || "1049";

  // In PHP, date is formatted to "d M, Y" (e.g. 08 Oct, 2025)
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
        width: "1600px",
        height: "1236px",
        position: "relative",
        backgroundImage: `url(${templateSrc})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxSizing: "border-box",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        margin: "0 auto"
      }}
    >
      {/* 1. Member Photo overlay inside top-left box */}
      {photoSrc && (
        <div
          style={{
            position: "absolute",
            left: "120px",
            top: "98px",
            width: "190px",
            height: "228px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
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

      {/* 2. Certificate Number overlay on top-right (pulled back to prevent boundary overflow) */}
      <div
        style={{
          position: "absolute",
          left: "1355px",
          top: "115px",
          width: "160px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#000000",
          fontFamily: "Arial, sans-serif",
          textAlign: "left",
          whiteSpace: "nowrap"
        }}
      >
        {certNumber}
      </div>

      {/* 3. Member Name overlay centered on the dotted line */}
      <div
        style={{
          position: "absolute",
          left: "0px",
          top: "615px", // baseline Y=660, font size 30pt
          width: "1600px",
          textAlign: "center",
          fontSize: "38px", // 30pt matches old PHP GD size
          fontWeight: "bold",
          color: "#000000",
          textTransform: "uppercase",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {data.fullName}
      </div>

      {/* 4. Date overlay next to "Dated" */}
      <div
        style={{
          position: "absolute",
          left: "220px",
          top: "888px", // baseline Y=915, font size 20pt
          fontSize: "26px", // 20pt matches old PHP GD size
          fontWeight: "bold",
          color: "#000000",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {formattedDate}
      </div>

      {/* 5. QR Code overlay on bottom-center */}
      {qrSrc && (
        <div
          style={{
            position: "absolute",
            left: "725px",
            top: "800px",
            width: "150px",
            height: "150px",
            padding: "4px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box"
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

      {/* 6. Signature block cover to hide Danish Khan's signature and overlay the Authorized Signatory details */}
      <div
        style={{
          position: "absolute",
          left: "1230px",
          top: "925px",
          width: "245px",
          height: "155px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end"
        }}
      >
        {signatureSrc && (
          <img
            src={signatureSrc}
            alt="Authorized Signature"
            style={{
              height: "55px",
              objectFit: "contain",
              mixBlendMode: "multiply",
              marginBottom: "3px"
            }}
          />
        )}
        <div style={{ width: "210px", borderTop: "1.2px solid #555555", margin: "2px 0" }} />
        <p style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#333333",
          margin: 0,
          textAlign: "center"
        }}>
          (Seal & Signature)
        </p>
        <p style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "10px",
          color: "#555555",
          margin: "1px 0 0 0",
          textAlign: "center"
        }}>
          Authorized Signatory
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
    templateBase64,
    signatureBase64
  ] = await Promise.all([
    photoBase64Input ? Promise.resolve(photoBase64Input) : (data.photoUrl ? getBase64ImageFromUrl(data.photoUrl) : Promise.resolve("")),
    qrBase64Input ? Promise.resolve(qrBase64Input) : getBase64ImageFromUrl(data.qrCodeUrl),
    getBase64ImageFromUrl("/images/membership_template.jpg"),
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
          templateBase64={templateBase64}
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

          // A4 landscape dimensions: 297 x 210 mm
          // Certificate aspect ratio: 1600 / 1236 = 1.2945
          // Center the image keeping the ratio:
          // width = 210 * 1.2945 = 271.8 mm
          // x_offset = (297 - 271.8) / 2 = 12.6 mm
          pdf.addImage(imgData, "JPEG", 12.6, 0, 271.8, 210, undefined, "FAST");
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
