"use client";

import React from "react";

// Interface for Certificate Data
export interface CertificateData {
  certNo: string;
  qrCodeUrl: string;
  verificationUrl: string;
  studentName: string;
  courseTitle: string;
  photoUrl?: string | null;
  fatherName: string;
  enrollmentNo: string;
  durationFrom: string;
  durationTo: string;
  grade: string;
  venue: string;
  performance: string;
  dateStr: string;
}

// Convert image URL to base64 to avoid CORS issues in canvas rendering
export async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;
  try {
    const res = await fetch(imageUrl, { mode: "cors" });
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to convert image to base64:", imageUrl, err);
    return imageUrl;
  }
}

interface CertificateRendererProps {
  data: CertificateData;
  photoBase64?: string;
  qrBase64?: string;
  logoBase64?: string;
  mcaBase64?: string;
  nitiBase64?: string;
  nsdcBase64?: string;
  msmeBase64?: string;
  emblemBase64?: string;
  isoSealBase64?: string;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  data,
  photoBase64,
  qrBase64,
  logoBase64,
  mcaBase64,
  nitiBase64,
  nsdcBase64,
  msmeBase64,
  emblemBase64,
  isoSealBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const logoSrc = logoBase64 || "/logo.png";
  const mcaSrc = mcaBase64 || "/images/mca_logo.png";
  const nitiSrc = nitiBase64 || "/images/niti_aayog.png";
  const nsdcSrc = nsdcBase64 || "/images/nsdc.png";
  const msmeSrc = msmeBase64 || "/images/msme.png";
  const emblemSrc = emblemBase64 || "/images/emblem_of_india.png";
  const isoSealSrc = isoSealBase64 || "/images/iso_seal.png";

  return (
    <div
      id={`certificate-render-container-${data.certNo}`}
      style={{
        width: "794px",
        height: "1123px",
        position: "relative",
        backgroundColor: "#ffffff",
        fontFamily: "'Poppins', sans-serif",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "45px"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Poppins:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&display=swap');
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
          gap: "12px",
          padding: "35px 0",
          boxSizing: "border-box",
          opacity: 0.04,
          userSelect: "none"
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "8px",
              color: "#cc0000",
              whiteSpace: "nowrap",
              letterSpacing: "2px",
              width: "100%",
              textAlign: "center"
            }}
          >
            {"DK FOUNDATION OF FREEDOM AND JUSTICE   ".repeat(4)}
          </div>
        ))}
      </div>

      {/* Centered Large watermark logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "360px",
          height: "360px",
          opacity: 0.06,
          pointerEvents: "none",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          userSelect: "none"
        }}
      >
        <img
          src={logoSrc}
          alt="Watermark Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain"
          }}
        />
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
        <defs>
          <linearGradient id="goldBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="30%" stopColor="#ffd700" />
            <stop offset="70%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
        </defs>
        {/* Outer gold border line using the linear gradient */}
        <rect x="15" y="15" width="764" height="1093" fill="none" stroke="url(#goldBorderGradient)" strokeWidth="20" />
        
        {/* Inner thin red border line */}
        <rect x="30" y="30" width="734" height="1063" fill="none" stroke="#cc0000" strokeWidth="3" />
        
        {/* Symmetrical Vector Corner Ornaments */}
        <path d="M 65 25 L 25 25 L 25 65" fill="none" stroke="#cc0000" strokeWidth="6" />
        <path d="M 729 25 L 769 25 L 769 65" fill="none" stroke="#cc0000" strokeWidth="6" />
        <path d="M 25 1058 L 25 1098 L 65 1098" fill="none" stroke="#cc0000" strokeWidth="6" />
        <path d="M 769 1058 L 769 1098 L 729 1098" fill="none" stroke="#cc0000" strokeWidth="6" />
      </svg>

      {/* Certificate Content wrapper */}
      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 15px" }}>
        
        {/* Top Header */}
        <div style={{ textAlign: "center", width: "100%", marginBottom: "15px" }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "24px",
            color: "#cc0000",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            margin: 0
          }}>
            DK Foundation of Freedom and Justice
          </h1>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            color: "#333",
            margin: "4px 0 0 0"
          }}>
            (Under Section 8 of The Companies Act, 2013 Govt of India)
          </p>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "11px",
            color: "#000",
            margin: "3px 0 0 0"
          }}>
            CIN No. U88900UP2023NPL185611
          </p>
        </div>

        {/* Top Meta (Logo on Left, Student Photo on Right) */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: "15px",
          padding: "0 10px"
        }}>
          {/* Foundation Logo */}
          <div style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "2px dashed #cc0000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffffff",
            padding: "5px"
          }}>
            <img
              src={logoSrc}
              alt="Foundation Logo"
              style={{ width: "85%", height: "85%", objectFit: "contain" }}
            />
          </div>

          {/* Student's Photo */}
          <div style={{
            width: "110px",
            height: "140px",
            border: "1px solid #999",
            borderRadius: "15px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fafafa"
          }}>
            {photoSrc ? (
              <img
                src={photoSrc}
                alt="Student's Photo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>Student Photo</span>
            )}
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            color: "#cc0000",
            fontSize: "38px",
            fontWeight: 700,
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            margin: 0
          }}>
            Certificate Of Completion
          </h2>
        </div>

        {/* Helper Style for input fields and rows */}
        <style>{`
          .cert-row {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            color: #222;
            width: 100%;
            margin-bottom: 20px;
          }
          .cert-input-line {
            flex-grow: 1;
            border-bottom: 2px solid #444;
            height: 28px;
            margin-left: 10px;
            background-color: transparent;
            color: #001C55;
            font-weight: 700;
            font-size: 17px;
            padding: 0 10px;
            display: inline-flex;
            align-items: center;
          }
          .cert-inline-inputs {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            width: 100%;
          }
          .cert-inline-inputs .cert-row {
            flex: 1;
          }
        `}</style>

        {/* Form Content Body */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: "0 10px" }}>
          
          <div className="cert-row">
            This is to certify that Mr./Ms. 
            <div className="cert-input-line" style={{ textTransform: "uppercase" }}>
              {data.studentName}
            </div>
          </div>
          
          <div className="cert-row">
            Son/Daughter of Mr. 
            <div className="cert-input-line">
              {data.fatherName}
            </div>
          </div>

          <div className="cert-row">
            has successfully completed the 
            <div className="cert-input-line">
              {data.courseTitle}
            </div>
          </div>

          <div className="cert-row">
            Conducted by our institution 
            <div className="cert-input-line">
              DK Foundation of Freedom and Justice
            </div>
          </div>

          <div className="cert-inline-inputs">
            <div className="cert-row">
              Course Duration: From 
              <div className="cert-input-line">
                {data.durationFrom}
              </div>
            </div>
            <div className="cert-row" style={{ flex: 0.8 }}>
              to 
              <div className="cert-input-line">
                {data.durationTo}
              </div>
            </div>
          </div>

          <div className="cert-inline-inputs">
            <div className="cert-row" style={{ flex: 0.8 }}>
              Grade/Percentage: 
              <div className="cert-input-line">
                {data.grade}
              </div>
            </div>
            <div className="cert-row">
              Training Venue: 
              <div className="cert-input-line">
                {data.venue}
              </div>
            </div>
          </div>

          <div style={{
            fontStyle: "italic",
            fontSize: "14px",
            color: "#444",
            marginTop: "10px",
            textAlign: "left",
            lineHeight: "1.6",
            fontWeight: 500
          }}>
            During this period, his/her performance and conduct were found to be <span style={{ color: "#001C55", fontWeight: 700, fontStyle: "normal", borderBottom: "1.5px solid #444", padding: "0 5px" }}>{data.performance}</span>.
            <br />
            We wish him/her every success in all future endeavors.
          </div>
        </div>

        {/* Certificate Metadata Info */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "25px",
          padding: "0 10px",
          fontSize: "14px",
          fontWeight: 700,
          color: "#222"
        }}>
          <div>Certificate No: <span style={{ color: "#cc0000", fontFamily: "monospace" }}>{data.certNo}</span></div>
          <div>Date of Issue: <span style={{ color: "#cc0000" }}>{data.dateStr}</span></div>
        </div>

        {/* Footer Section (Signature, Seal, QR Code) */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginTop: "auto",
          padding: "0 10px 10px 10px"
        }}>
          {/* Signature Area */}
          <div style={{
            textAlign: "center",
            width: "220px",
            paddingTop: "40px",
            position: "relative"
          }}>
            <div style={{ borderTop: "1px solid #333", width: "100%", marginBottom: "5px" }}></div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#222" }}>(Seal & Signature)</span>
            <br />
            <span style={{ fontSize: "11px", color: "#555" }}>Director / Authorized Signatory</span>
          </div>

          {/* ISO Seal */}
          <div style={{
            width: "90px",
            height: "90px",
            marginTop: "-15px"
          }}>
            <img
              src={isoSealSrc}
              alt="ISO 9001 Seal"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* QR Code */}
          <div style={{
            width: "95px",
            height: "95px",
            border: "2px solid #333",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: "2px"
          }}>
            {qrSrc && (
              <img
                src={qrSrc}
                alt="QR CODE"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>
        </div>

        {/* Gov Logos */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #ccc",
          paddingTop: "10px",
          marginTop: "10px"
        }}>
          <img src={mcaSrc} alt="MCA Govt of India" style={{ height: "30px", objectFit: "contain" }} />
          <img src={nitiSrc} alt="NITI Aayog" style={{ height: "28px", objectFit: "contain" }} />
          <img src={nsdcSrc} alt="NSDC" style={{ height: "30px", objectFit: "contain" }} />
          <img src={emblemSrc} alt="Emblem" style={{ height: "32px", objectFit: "contain" }} />
          <img src={msmeSrc} alt="MSME Govt of India" style={{ height: "28px", objectFit: "contain" }} />
        </div>

        {/* Footer Verification text */}
        <div style={{
          fontSize: "11px",
          color: "#cc0000",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "10px",
          lineHeight: "1.4"
        }}>
          An Internationally Approved Certification Body by UK Ackredetering Company Ltd.
          <br />
          Verify this certificate online on www.dkffj.org
        </div>

      </div>
    </div>
  );
};

export interface GeneratedCertificateFiles {
  pdfBlob: Blob;
  pngBlob: Blob;
}

// Generates the PDF and PNG using html2canvas and jsPDF, returns both blobs
export async function generateCertificatePDFClient(
  data: CertificateData
): Promise<GeneratedCertificateFiles> {
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default || html2canvasModule;
  const jspdfModule = await import("jspdf");
  const jsPDF = jspdfModule.default || jspdfModule.jsPDF || jspdfModule;

  let photoBase64 = "";
  if (data.photoUrl) {
    photoBase64 = await getBase64ImageFromUrl(data.photoUrl);
  }
  const qrBase64 = await getBase64ImageFromUrl(data.qrCodeUrl);

  // Pre-resolve all local branding assets to Base64 to bypass CORS & html2canvas SVG limitations
  const logoBase64 = await getBase64ImageFromUrl("/logo.png");
  const mcaBase64 = await getBase64ImageFromUrl("/images/mca_logo.png");
  const nitiBase64 = await getBase64ImageFromUrl("/images/niti_aayog.png");
  const nsdcBase64 = await getBase64ImageFromUrl("/images/nsdc.png");
  const msmeBase64 = await getBase64ImageFromUrl("/images/msme.png");
  const emblemBase64 = await getBase64ImageFromUrl("/images/emblem_of_india.png");
  const isoSealBase64 = await getBase64ImageFromUrl("/images/iso_seal.png");

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
        <CertificateRenderer
          data={data}
          photoBase64={photoBase64}
          qrBase64={qrBase64}
          logoBase64={logoBase64}
          mcaBase64={mcaBase64}
          nitiBase64={nitiBase64}
          nsdcBase64={nsdcBase64}
          msmeBase64={msmeBase64}
          emblemBase64={emblemBase64}
          isoSealBase64={isoSealBase64}
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
            backgroundColor: "#ffffff"
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
          const pdfBlob = pdf.output("blob");

          // Generate PNG Blob
          const pngBlob = await new Promise<Blob>((resolvePng, rejectPng) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolvePng(blob);
              } else {
                rejectPng(new Error("Canvas toBlob failed"));
              }
            }, "image/png");
          });

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
      }, 2000);
    } catch (err) {
      reject(err);
    }
  });
}
