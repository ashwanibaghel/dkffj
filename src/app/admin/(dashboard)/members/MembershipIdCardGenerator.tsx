"use client";

import React from "react";
import { getBase64ImageFromUrl } from "../registrations/CertificateGenerator";
import { autoDetectMembershipLevel, MEMBERSHIP_TIERS } from "@/lib/data/membershipTiers";

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
        padding: 0,
        backgroundColor: "#111827",
        display: "inline-block",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "764px",
          height: "570px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "#111827",
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
            height: "570px",
            backgroundColor: "#0077b6",
            color: "#ffffff",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              letterSpacing: "1px",
              marginTop: "14px",
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
              borderRadius: "50%",
              marginTop: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              flexShrink: 0
            }}
          >
            <img
              src={logoSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block"
              }}
              alt="Logo"
            />
          </div> 
          
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "8px 8px 1px",
              textTransform: "uppercase",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }}
          >
            DK Foundation of Freedom and Justice
          </div>
          
          <div
            style={{
              fontSize: "11px",
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
              marginBottom: "7px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Regd. By Ministry of Corporate affairs Govt. of India
          </div>
          
          <div
            style={{
              width: "120px",
              height: "120px",
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
              marginTop: "8px",
              color: "#ffffff",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {data.fullName}
          </div>
          
          <div
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginTop: "4px",
              color: "#ffffff",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {data.designation}
          </div>

          {/* Tier Level Badge */}
          {(() => {
            const levelKey = autoDetectMembershipLevel(data.designation, data.workingArea);
            const tier = MEMBERSHIP_TIERS[levelKey];
            return (
              <div
                style={{
                  marginTop: "5px",
                  fontSize: "10.5px",
                  fontWeight: "800",
                  backgroundColor: "#ffffff",
                  color: "#001C55",
                  padding: "2.5px 12px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px"
                }}
              >
                {tier.label.replace(" Membership", "")}
              </div>
            );
          })()}
          
          <div
            style={{
              width: "100%",
              padding: "0 16px",
              marginTop: "12px",
              fontSize: "13px",
              lineHeight: "1.38",
              textAlign: "center",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            <div style={{ marginBottom: "7px" }}>
              <span style={{ fontWeight: "bold" }}>Work Area:</span> {data.workingArea}
            </div>
            <div style={{ marginBottom: "7px" }}>
              <span style={{ fontWeight: "bold" }}>Valid Till:</span> {data.validFromStr} to {data.validToStr}
            </div>
            <div style={{ marginBottom: "5px", lineHeight: "1.3" }}>
              <span style={{ fontWeight: "bold" }}>Add:</span> {data.addressStr} {data.districtStr} {data.stateStr} {data.pincodeStr ? `- ${data.pincodeStr}` : ""}
            </div>
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: "55px",
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
              minHeight: "45px",
              padding: "5px 10px",
              fontSize: "9px",
              lineHeight: "1.25",
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
            height: "570px",
            backgroundColor: "#0077b6",
            color: "#ffffff",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxSizing: "border-box",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}
        >
          <div
            style={{
              marginTop: "17px",
              textAlign: "center",
              fontSize: "16px",
              lineHeight: "1.3",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Regd. No.
            <br />
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                letterSpacing: "0.5px"
              }}
            >
              U88900UP2023NPL185611
            </span>
          </div>
          
          <div
            style={{
              width: "205px",
              height: "205px",
              borderRadius: "50%",
              marginTop: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              flexShrink: 0
            }}
          >
            <img
              src={logoSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block"
              }}
              alt="Large Logo"
            />
          </div>
          
          <div
            style={{
              marginTop: "25px",
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
              height: "190px",
              backgroundColor: "#ffffff",
              borderTopLeftRadius: "50% 18%",
              borderTopRightRadius: "50% 18%",
              color: "#333333",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: "10px",
              boxSizing: "border-box"
            }}
          >
            {qrSrc ? (
              <img
                src={qrSrc}
                style={{
                  width: "102px",
                  height: "102px",
                  backgroundColor: "#ffffff",
                  border: 0,
                  marginBottom: "7px",
                  objectFit: "contain"
                }}
                alt="QR Code"
              />
            ) : (
              <div
                style={{
                  width: "102px",
                  height: "102px",
                  backgroundColor: "#eeeeee",
                  border: "1px solid #cccccc",
                  marginBottom: "7px",
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
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "6px",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}
            >
              ID NO.{data.membershipNo || data.ackNo}
            </div>
            
            <div
              style={{
                fontSize: "17px",
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

  const [photoBase64, qrBase64, logoBase64] = await Promise.all([
    photoBase64Input ? Promise.resolve(photoBase64Input) : (data.photoUrl ? getBase64ImageFromUrl(data.photoUrl) : Promise.resolve("")),
    qrBase64Input ? Promise.resolve(qrBase64Input) : getBase64ImageFromUrl(data.qrCodeUrl),
    getBase64ImageFromUrl("/logo.png")
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
            backgroundColor: "#111827"
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

          // Preserve the classic side-by-side 4:3 card-sheet proportions without stretching.
          const maxWidthMm = 273;
          const maxHeightMm = 190;
          const canvasRatio = canvas.width / canvas.height;
          let imageWidthMm = maxWidthMm;
          let imageHeightMm = imageWidthMm / canvasRatio;
          if (imageHeightMm > maxHeightMm) {
            imageHeightMm = maxHeightMm;
            imageWidthMm = imageHeightMm * canvasRatio;
          }
          const imageX = (297 - imageWidthMm) / 2;
          const imageY = (210 - imageHeightMm) / 2;
          pdf.addImage(imgData, "JPEG", imageX, imageY, imageWidthMm, imageHeightMm, undefined, "FAST");
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
      }, 400);
    } catch (err) {
      reject(err);
    }
  });
}
