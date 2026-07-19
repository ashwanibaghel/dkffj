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
        padding: "10px",
        backgroundColor: "#f8fafc",
        display: "inline-block",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "1000px",
          height: "600px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "80px",
          backgroundColor: "#f8fafc",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {/* Google Fonts injection */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        `}</style>

        {/* ---- FRONT CARD ---- */}
        <div
          style={{
            width: "380px",
            height: "580px",
            backgroundColor: "#0077b6",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "2px solid #005f96",
            boxSizing: "border-box",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              letterSpacing: "1px",
              marginTop: "15px",
              textTransform: "uppercase",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Identity Card
          </div>
          
          <div
            style={{
              width: "55px",
              height: "55px",
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              marginTop: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "2px solid #d62828",
              overflow: "hidden"
            }}
          >
            <img src={logoSrc} style={{ width: "80%", height: "80%", objectFit: "contain" }} alt="Logo" />
          </div> 
          
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "8px 10px 2px 10px",
              textTransform: "uppercase",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            DK Foundation of Freedom and Justice
          </div>
          
          <div
            style={{
              fontSize: "10px",
              color: "#ffe6a7",
              textAlign: "center",
              fontWeight: "600",
              textTransform: "uppercase",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Human Rights Protection
          </div>
          
          <div
            style={{
              fontSize: "7.5px",
              color: "#e0e0e0",
              marginBottom: "12px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Regd. By Ministry of Corporate affairs Govt. of India
          </div>
          
          <div
            style={{
              width: "125px",
              height: "125px",
              border: "2px solid #000000",
              backgroundColor: "#ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden"
            }}
          >
            <img src={photoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Profile Photo" />
          </div>
          
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "10px",
              color: "#ffffff",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {data.fullName}
          </div>
          
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginTop: "4px",
              color: "#ffffff",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {data.designation}
          </div>
          
          <div
            style={{
              width: "100%",
              padding: "0 25px",
              marginTop: "15px",
              fontSize: "13px",
              lineHeight: "1.5",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            <div style={{ marginBottom: "5px" }}>
              <span style={{ fontWeight: "bold" }}>Work Area:</span> {data.workingArea}
            </div>
            <div style={{ marginBottom: "5px" }}>
              <span style={{ fontWeight: "bold" }}>Valid Till:</span> {data.validFromStr} to {data.validToStr}
            </div>
            <div style={{ marginBottom: "5px", lineHeight: "1.3" }}>
              <span style={{ fontWeight: "bold" }}>Add:</span> {data.addressStr} {data.districtStr} {data.stateStr} {data.pincodeStr ? `- ${data.pincodeStr}` : ""}
            </div>
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              right: "25px",
              textAlign: "right"
            }}
          >
            <span
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "22px",
                color: "#ffffff",
                transform: "rotate(-5deg)",
                display: "inline-block"
              }}
            >
              Wasim Qureshi
            </span>
            <div style={{ fontSize: "7.5px", color: "#e0e0e0", marginTop: "-3px" }}>Authorized Signatory</div>
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              backgroundColor: "#d62828",
              color: "#ffffff",
              textAlign: "center",
              padding: "6px 10px",
              fontSize: "9.5px",
              lineHeight: "1.3",
              fontWeight: "500",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            <strong>Head Office Address</strong>
            <br />
            117/M/29-C Kakadeo M-block, Madhuvan Appt. Road,
            <br />
            Kanpur Nagar 208019 (UP)
          </div>
        </div>

        {/* ---- BACK CARD ---- */}
        <div
          style={{
            width: "380px",
            height: "580px",
            backgroundColor: "#0077b6",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "2px solid #005f96",
            boxSizing: "border-box",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}
        >
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "14px",
              lineHeight: "1.3",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Regd. No.
            <br />
            <span
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                letterSpacing: "0.5px"
              }}
            >
              U88900UP2023NPL185611
            </span>
          </div>
          
          <div
            style={{
              width: "160px",
              height: "160px",
              backgroundColor: "#ffffff",
              borderRadius: "50%",
              marginTop: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "4px solid #d62828",
              overflow: "hidden"
            }}
          >
            <img src={logoSrc} style={{ width: "80%", height: "80%", objectFit: "contain" }} alt="Large Logo" />
          </div>
          
          <div
            style={{
              marginTop: "30px",
              fontSize: "22px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Mob. {data.mobileStr}
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "200px",
              backgroundColor: "#ffffff",
              borderTopLeftRadius: "50% 18%",
              borderTopRightRadius: "50% 18%",
              color: "#333333",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "25px",
              boxSizing: "border-box"
            }}
          >
            {qrSrc ? (
              <img
                src={qrSrc}
                style={{
                  width: "90px",
                  height: "90px",
                  backgroundColor: "#eeeeee",
                  border: "1px solid #cccccc",
                  marginBottom: "10px",
                  objectFit: "contain"
                }}
                alt="QR Code"
              />
            ) : (
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  backgroundColor: "#eeeeee",
                  border: "1px solid #cccccc",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "10px",
                  color: "#666666"
                }}
              >
                QR Code
              </div>
            )}
            
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "5px",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}
            >
              ID NO.{data.membershipNo || data.ackNo}
            </div>
            
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#000000",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}
            >
              Website : www.dkffj.org
            </div>
        </div>
      </div>
    </div>
    </div>
  );
};
// Generates the Landscape ID Card PDF, returns the file blob and png blob
export async function generateMembershipIdCardPDFClient(
  data: MembershipIdCardData,
  photoBase64Input?: string,
  qrBase64Input?: string
): Promise<GenerationResult> {
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const jspdfModule = await import("jspdf");
  const jsPDF = jspdfModule.default || jspdfModule.jsPDF || jspdfModule;

  const photoBase64 = photoBase64Input || (data.photoUrl ? await getBase64ImageFromUrl(data.photoUrl) : "");
  const qrBase64 = qrBase64Input || await getBase64ImageFromUrl(data.qrCodeUrl);
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
      // Wait 1.2 seconds to ensure fonts, photos and QR SVGs are loaded and rendered
      setTimeout(async () => {
        try {
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in offscreen container");
          }

          const canvas = await html2canvas(targetElement, {
            scale: 2.0, // Crisp resolution, optimized from 2.5
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
          const imgData = canvas.toDataURL("image/jpeg", 0.80); // Compressed from 0.98 for smaller attachments

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
      }, 1200);
    } catch (err) {
      reject(err);
    }
  });
}
