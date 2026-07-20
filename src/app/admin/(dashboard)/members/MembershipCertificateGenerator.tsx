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
}

export const MembershipCertificateRenderer: React.FC<MembershipCertificateRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  templateBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const templateSrc = templateBase64 || "/images/membership_template.jpg";

  // Extracts numeric ID from certificate number (e.g. DKM-2026-9027 -> 9027, or keep original)
  const certNumber = data.membershipNo ? data.membershipNo.replace(/^[^\d]*/, "") : "1049";

  // Format date to DD MMM, YYYY if possible, matching the original layout style (e.g., 08 Oct, 2025)
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
        width: "1123px", // Landscape A4 Width in pixels at 96 DPI
        height: "868px",  // Landscape A4 Height matching 1600x1236 ratio
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
            left: "84px",
            top: "69px",
            width: "133px",
            height: "160px",
            overflow: "hidden",
            border: "1px solid #333333",
            backgroundColor: "#ffffff",
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

      {/* 2. Certificate Number overlay on top-right */}
      <div
        style={{
          position: "absolute",
          left: "989px",
          top: "85px",
          fontSize: "19px",
          fontWeight: "800",
          color: "#000000",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {certNumber}
      </div>

      {/* 3. Member Name overlay on the dotted line */}
      <div
        style={{
          position: "absolute",
          left: "80px",
          top: "435px",
          width: "963px",
          textAlign: "center",
          fontSize: "27px",
          fontWeight: "800",
          color: "#000000",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {data.fullName}
      </div>

      {/* 4. Date overlay on bottom-left next to "Dated" */}
      <div
        style={{
          position: "absolute",
          left: "154px",
          top: "626px",
          fontSize: "17.5px",
          fontWeight: "800",
          color: "#000000",
          fontFamily: "Arial, sans-serif",
          letterSpacing: "0.5px"
        }}
      >
        {formattedDate}
      </div>

      {/* 5. QR Code overlay on bottom-center */}
      {qrSrc && (
        <div
          style={{
            position: "absolute",
            left: "509px",
            top: "561px",
            width: "105px",
            height: "105px",
            padding: "3px",
            backgroundColor: "#ffffff",
            border: "1px solid #dddddd",
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
    templateBase64
  ] = await Promise.all([
    photoBase64Input ? Promise.resolve(photoBase64Input) : (data.photoUrl ? getBase64ImageFromUrl(data.photoUrl) : Promise.resolve("")),
    qrBase64Input ? Promise.resolve(qrBase64Input) : getBase64ImageFromUrl(data.qrCodeUrl),
    getBase64ImageFromUrl("/images/membership_template.jpg")
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
            scale: 2.0, // Crisp resolution
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
