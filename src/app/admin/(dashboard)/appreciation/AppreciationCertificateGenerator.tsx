"use client";

import React from "react";
import { getBase64ImageFromUrl } from "../registrations/CertificateGenerator";

export interface AppreciationCertificateData {
  applicationNo: string;
  fullName: string;
  socialWorkField: string;
  issueDateStr: string;
  qrCodeUrl: string;
  verificationUrl: string;
}

interface AppreciationCertificateRendererProps {
  data: AppreciationCertificateData;
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

export const AppreciationCertificateRenderer: React.FC<AppreciationCertificateRendererProps> = ({
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
  const mcaSrc = mcaBase64 || "/images/mca_logo.png";
  const nitiSrc = nitiBase64 || "/images/niti_aayog.png";
  const nsdcSrc = nsdcBase64 || "/images/nsdc.png";
  const msmeSrc = msmeBase64 || "/images/msme.png";
  const emblemSrc = emblemBase64 || "/images/emblem_of_india.png";
  const isoSealSrc = isoSealBase64 || "/images/iso_seal.png";
  const signatureSrc = signatureBase64 || "/images/director_sig.png"; // Fallback to path

  return (
    <div
      id={`appreciation-certificate-render-container-${data.applicationNo}`}
      style={{
        width: "1123px", // Landscape A4 Width in pixels at 96 DPI
        height: "794px",  // Landscape A4 Height in pixels at 96 DPI
        position: "relative",
        backgroundColor: "#fbf8f3", // Warm cream/premium ivory background
        fontFamily: "'Playfair Display', Georgia, serif",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "45px"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=Inter:wght@400;600;700&display=swap');
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
          flexWrap: "wrap",
          gap: "40px 60px",
          padding: "60px",
          boxSizing: "border-box",
          opacity: 0.05,
          userSelect: "none"
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "11px",
              color: "#001C55",
              transform: "rotate(-30deg)",
              whiteSpace: "nowrap"
            }}
          >
            DK FOUNDATION OF FREEDOM & JUSTICE
          </div>
        ))}
      </div>

      {/* Main Certificate Border */}
      <div
        style={{
          width: "100%",
          height: "100%",
          border: "18px double #001C55", // Heavy double border in corporate blue
          borderRadius: "4px",
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px 40px",
          boxSizing: "border-box",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)"
        }}
      >
        {/* Top Header Logos */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "15px" }}>
          {/* Organization logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={logoSrc} alt="DKFFJ Logo" style={{ height: "55px", width: "55px", objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "16px", fontWeight: "bold", color: "#001C55", letterSpacing: "1px", fontFamily: "'Cinzel', serif" }}>
                DK FOUNDATION
              </span>
              <span style={{ fontSize: "9px", fontWeight: "bold", color: "#C00000", letterSpacing: "1.5px" }}>
                OF FREEDOM AND JUSTICE
              </span>
            </div>
          </div>

          {/* Reference/App No */}
          <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: "12px", color: "#444444" }}>
            <div><strong>REF NO:</strong> {data.applicationNo}</div>
            <div style={{ marginTop: "3px" }}><strong>DATE:</strong> {data.issueDateStr}</div>
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: "center", margin: "10px 0 5px 0" }}>
          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "34px",
            color: "#001C55",
            margin: 0,
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            letterSpacing: "1.5px"
          }}>
            Certificate of Appreciation
          </h2>
          <div style={{
            height: "2px",
            width: "280px",
            backgroundColor: "#C00000",
            margin: "8px auto 0 auto",
            backgroundImage: "linear-gradient(to right, transparent, #C00000, transparent)"
          }} />
        </div>

        {/* Main Certificate Body */}
        <div style={{ textAlign: "center", maxWidth: "800px", marginTop: "15px" }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "16px",
            color: "#666666",
            margin: "0 0 10px 0"
          }}>
            This certificate is proudly presented to
          </p>

          <h3 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "28px",
            fontWeight: "bold",
            color: "#C00000", // Dark red name for high emphasis
            margin: "5px 0 15px 0",
            letterSpacing: "1px"
          }}>
            {data.fullName}
          </h3>

          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12.5px",
            color: "#475569",
            lineHeight: "1.8",
            margin: 0
          }}>
            in recognition and deep appreciation of their dedicated services, outstanding contribution, and selfless efforts in the field of <strong style={{ color: "#001C55" }}>&ldquo;{data.socialWorkField}&rdquo;</strong>. Their unwavering commitment to public welfare, social equality, and humanitarian relief has set a benchmark of excellence for the community.
          </p>
        </div>

        {/* Bottom Section (Signatures, seals, QR code) */}
        <div style={{
          marginTop: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end"
        }}>
          {/* Left Column: Authorized Signatory */}
          <div style={{ width: "230px", textAlign: "center" }}>
            <div style={{ height: "50px", display: "flex", justifyContent: "center", alignItems: "flex-end", overflow: "hidden", marginBottom: "5px" }}>
              {signatureSrc && (
                <img
                  src={signatureSrc}
                  alt="Director Signature"
                  style={{ maxHeight: "100%", maxWidth: "160px", objectFit: "contain" }}
                />
              )}
            </div>
            <div style={{ height: "1px", width: "180px", backgroundColor: "#cccccc", margin: "0 auto 5px auto" }} />
            <strong style={{ display: "block", fontSize: "11px", color: "#333333" }}>Director / Authorized Signatory</strong>
            <span style={{ fontSize: "9px", color: "#666666", display: "block" }}>DK Foundation Executive Council</span>
          </div>

          {/* Center Column: High-Res ISO Seal */}
          <div style={{ height: "100px", width: "100px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "-10px" }}>
            <img src={isoSealSrc} alt="ISO 9001 Seal" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
          </div>

          {/* Right Column: Verification QR Code */}
          <div style={{ width: "230px", display: "flex", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "8.5px", color: "#666666", display: "block", fontWeight: "bold", textTransform: "uppercase", tracking: "0.5px" }}>
                  Public Verification
                </span>
                <span style={{ fontSize: "8px", color: "#94a3b8", display: "block" }}>Scan QR code to verify</span>
              </div>
              <div style={{
                width: "75px",
                height: "75px",
                border: "1px solid #e2e8f0",
                padding: "2px",
                backgroundColor: "#ffffff",
                borderRadius: "4px"
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
        </div>

        {/* Footer Branding Logos */}
        <div style={{
          marginTop: "18px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "6px 20px",
          borderRadius: "6px",
          border: "1px solid #e2dcd0",
          boxSizing: "border-box"
        }}>
          <img src={mcaSrc} alt="MCA" style={{ height: "30px", maxWidth: "120px", objectFit: "contain" }} />
          <img src={nitiSrc} alt="NITI Aayog" style={{ height: "28px", maxWidth: "80px", objectFit: "contain" }} />
          <img src={nsdcSrc} alt="NSDC" style={{ height: "30px", maxWidth: "80px", objectFit: "contain" }} />
          <img src={emblemSrc} alt="Emblem" style={{ height: "32px", maxWidth: "45px", objectFit: "contain" }} />
          <img src={msmeSrc} alt="MSME" style={{ height: "28px", maxWidth: "90px", objectFit: "contain" }} />
        </div>
      </div>
    </div>
  );
};

export async function generateAppreciationPDFClient(
  data: AppreciationCertificateData
): Promise<Blob> {
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const jspdfModule = await import("jspdf");
  const jsPDF = jspdfModule.default || jspdfModule.jsPDF || jspdfModule;

  const qrBase64 = await getBase64ImageFromUrl(data.qrCodeUrl);
  const logoBase64 = await getBase64ImageFromUrl("/logo.png");
  const mcaBase64 = await getBase64ImageFromUrl("/images/mca_logo.png");
  const nitiBase64 = await getBase64ImageFromUrl("/images/niti_aayog.png");
  const nsdcBase64 = await getBase64ImageFromUrl("/images/nsdc.png");
  const msmeBase64 = await getBase64ImageFromUrl("/images/msme.png");
  const emblemBase64 = await getBase64ImageFromUrl("/images/emblem_of_india.png");
  const isoSealBase64 = await getBase64ImageFromUrl("/images/iso_seal.png");
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
        <AppreciationCertificateRenderer
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

      setTimeout(async () => {
        try {
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in offscreen container");
          }

          const canvas = await html2canvas(targetElement, {
            scale: 2.5,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#fbf8f3"
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          // Landscape A4 size PDF: 297mm x 210mm
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST");
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
