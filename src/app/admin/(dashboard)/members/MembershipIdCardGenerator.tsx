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
  signatureBase64?: string;
}

export interface GenerationResult {
  pdfBlob: Blob;
  pngBlob: Blob;
}

export const MembershipIdCardRenderer: React.FC<MembershipIdCardRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  logoBase64,
  signatureBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=300";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const logoSrc = logoBase64 || "/logo.png";
  const signatureSrc = signatureBase64 || "/images/course_director_sig.png";

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
              letterSpacing: "1.2px",
              marginTop: "12px",
              marginBottom: "8px",
              textTransform: "uppercase",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Identity Card
          </div>
          
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              marginTop: "2px",
              marginBottom: "6px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "2px solid #ffffff",
              overflow: "hidden",
              flexShrink: 0,
              boxSizing: "border-box"
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
              fontSize: "14.5px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "5px 8px 1px",
              textTransform: "uppercase",
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: "1.2"
            }}
          >
            DK Foundation of Freedom and Justice
          </div>
          
          <div
            style={{
              fontSize: "11.5px",
              color: "#ffffff",
              textAlign: "center",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            Human Rights Protection
          </div>
          
          <div
            style={{
              fontSize: "9px",
              fontWeight: "700",
              color: "#ffffff",
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
              overflow: "hidden",
              flexShrink: 0
            }}
          >
            <img src={photoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Profile Photo" />
          </div>
          
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginTop: "6px",
              color: "#ffffff",
              textAlign: "center",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {data.fullName}
          </div>
          
          <div
            style={{
              fontSize: "15px",
              fontWeight: "700",
              marginTop: "2px",
              color: "#ffffff",
              textAlign: "center",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {data.designation}
          </div>

          <div
            style={{
              width: "100%",
              padding: "0 18px",
              marginTop: "6px",
              fontSize: "13.5px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold", width: "95px", textAlign: "left", flexShrink: 0 }}>Work Area :</span>
              <span style={{ textAlign: "left", flex: 1, fontWeight: "700" }}>{data.workingArea || "N/A"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold", width: "95px", textAlign: "left", flexShrink: 0 }}>Valid Till :</span>
              <span style={{ textAlign: "left", flex: 1, fontWeight: "700" }}>{data.validFromStr} to {data.validToStr}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "4px", lineHeight: "1.3" }}>
              <span style={{ fontWeight: "bold", width: "95px", textAlign: "left", flexShrink: 0 }}>Address :</span>
              <span
                style={{
                  textAlign: "left",
                  flex: 1,
                  fontWeight: "700",
                  wordBreak: "break-word",
                  paddingRight: "125px"
                }}
              >
                {[data.addressStr, data.districtStr, data.stateStr].filter(Boolean).join(", ")}{data.pincodeStr ? ` - ${data.pincodeStr}` : ""}
              </span>
            </div>
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: "50px",
              right: "15px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 10
            }}
          >
            <img
              src={signatureSrc}
              alt="Authorized Signatory"
              style={{
                height: "46px",
                maxWidth: "135px",
                objectFit: "contain",
                marginBottom: "2px"
              }}
            />
            <div style={{ fontSize: "8.5px", fontWeight: "bold", color: "#ffffff", letterSpacing: "0.3px", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
              Authorized Signatory
            </div>
          </div>
          
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              backgroundColor: "#d62828",
              color: "#ffffff",
              textAlign: "center",
              minHeight: "46px",
              padding: "5px 10px",
              fontSize: "10px",
              lineHeight: "1.3",
              fontWeight: "700",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              boxSizing: "border-box",
              borderTop: "2px solid #b71c1c"
            }}
          >
            <strong style={{ fontSize: "11px", letterSpacing: "0.6px", display: "block", marginBottom: "2px" }}>Head Office Address</strong>
            117/M/29-C Kakadeo M-block, Madhuvan Appt. Road, Kanpur Nagar 208019 (UP)
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
              marginTop: "14px",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            CIN : U88900UP2023NPL185611
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
              border: "2px solid #ffffff",
              overflow: "hidden",
              flexShrink: 0,
              boxSizing: "border-box"
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
export async function getNativeWhiteOrGoldSignature(imageUrl: string, targetColor: string = "#FFFFFF"): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width || 300;
        const h = img.naturalHeight || img.height || 150;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(imageUrl);

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Target color (default White #FFFFFF)
        let r = 255, g = 255, b = 255;
        if (targetColor === "#FFD700" || targetColor.toLowerCase() === "gold") {
          r = 255; g = 215; b = 0;
        }

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 15) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Dark strokes in original signature -> convert to target color
            if (avg < 210) {
              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
              data[i + 3] = 255; // Fully opaque bold stroke
            } else {
              // White/light background -> make transparent
              data[i + 3] = 0;
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        console.error("Error in getNativeWhiteOrGoldSignature:", e);
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

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

  const [photoBase64, qrBase64, logoBase64, signatureBase64] = await Promise.all([
    photoBase64Input ? Promise.resolve(photoBase64Input) : (data.photoUrl ? getBase64ImageFromUrl(data.photoUrl) : Promise.resolve("")),
    qrBase64Input ? Promise.resolve(qrBase64Input) : getBase64ImageFromUrl(data.qrCodeUrl),
    getBase64ImageFromUrl("/logo.png"),
    getNativeWhiteOrGoldSignature("/images/course_director_sig.png", "#FFFFFF")
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
          signatureBase64={signatureBase64}
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
