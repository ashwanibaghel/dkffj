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
export async function getBase64ImageFromUrl(imageUrl: string, timeoutMs: number = 5000): Promise<string> {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl; // Local relative assets are same-origin and don't need base64 conversion

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(imageUrl, { 
      mode: "cors",
      signal: controller.signal
    });
    clearTimeout(id);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    clearTimeout(id);
    console.warn("Failed to convert image to base64 within timeout, using original URL:", imageUrl, err);
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
  signatureBase64?: string;
  borderBase64?: string;
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
  isoSealBase64,
  signatureBase64,
  borderBase64
}) => {
  const photoSrc = photoBase64 || data.photoUrl || "";
  const qrSrc = qrBase64 || data.qrCodeUrl || "";
  const logoSrc = logoBase64 || "/logo.png";
  const mcaSrc = mcaBase64 || "/images/mca.png";
  const nitiSrc = nitiBase64 || "/images/niti aayog.png";
  const nsdcSrc = nsdcBase64 || "/images/nsdc.png";
  const msmeSrc = msmeBase64 || "/images/msme.png";
  const emblemSrc = emblemBase64 || "/images/ministry of social justice and empowerment.png";
  const isoSealSrc = isoSealBase64 || "/images/iso.png";
  const signatureSrc = signatureBase64 || "/images/course_director_sig.png";
  const borderSrc = borderBase64 || "/images/completion-antique-royal-border-a4.svg";

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
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@700;800&family=UnifrakturMaguntia&family=Poppins:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&display=swap');
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

      {/* Antique royal A4 background/border; certificate content remains unchanged. */}
      <img
        src={borderSrc}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          pointerEvents: "none",
          zIndex: 0
        }}
      />

      {/* Certificate Content wrapper */}
      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", padding: "54px 38px 42px", boxSizing: "border-box" }}>
        
        {/* Top Header */}
        <div style={{ textAlign: "center", width: "100%", marginBottom: "4px" }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: "24px",
            color: "#a21e1e",
            letterSpacing: "1px",
            textTransform: "uppercase",
            margin: 0
          }}>
            DK FOUNDATION OF FREEDOM AND JUSTICE
          </h1>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            color: "#111111",
            letterSpacing: "0.8px",
            margin: "2px 0 0 0",
            textTransform: "uppercase"
          }}>
            Human Rights Protection
          </h2>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            color: "#333",
            margin: "2px 0 0 0"
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
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "110px",
          position: "relative",
          marginBottom: "4px",
          padding: "0 10px",
          boxSizing: "border-box"
        }}>
          {/* Foundation Logo */}
          <div style={{
            width: "105px",
            height: "105px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
            padding: "0px"
          }}>
            <img
              src={logoSrc}
              alt="Foundation Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Student's Photo */}
          <div style={{
            width: "95px",
            height: "110px",
            border: "1px solid #999",
            borderRadius: "15px",
            overflow: "hidden",
            position: "absolute",
            right: "10px",
            top: 0,
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
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h2 style={{
            fontFamily: "'UnifrakturMaguntia', 'Old English Text MT', serif",
            color: "#cc0000",
            fontSize: "38px",
            fontWeight: 400,
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
            margin-bottom: 12px;
          }
          .cert-input-line {
            flex-grow: 1;
            min-width: 0;
            border-bottom: 2px solid #444;
            min-height: 32px;
            margin-left: 10px;
            background-color: transparent;
            color: #111111;
            font-weight: 700;
            font-size: 16px;
            line-height: 1.25;
            overflow-wrap: anywhere;
            padding: 3px 10px 6px 10px;
            box-sizing: border-box;
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
        <div style={{ width: "100%", display: "flex", flexDirection: "column", padding: "0 10px", boxSizing: "border-box" }}>
          
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
            <span style={{ width: "140px", flexShrink: 0 }}>has successfully completed the</span>
            <div className="cert-input-line" style={{ marginLeft: 0 }}>
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
            marginTop: "6px",
            textAlign: "left",
            lineHeight: "1.6",
            fontWeight: 500
          }}>
            During this period, his/her performance and conduct were found to be <span style={{ color: "#111111", fontWeight: 700, fontStyle: "normal", textDecoration: "underline", textUnderlineOffset: "3px", padding: "0 3px" }}>{data.performance}</span>.
            <br />
            We wish him/her every success in all future endeavors.
          </div>
        </div>

        {/* Certificate Metadata Info */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "28px",
          padding: "0 10px",
          boxSizing: "border-box",
          fontSize: "12px",
          fontWeight: 700,
          color: "#222"
        }}>
          <div>Certificate No: <span style={{ color: "#cc0000", fontFamily: "monospace" }}>{data.certNo}</span></div>
          <div>Date of Issue: <span style={{ color: "#cc0000" }}>{data.dateStr}</span></div>
        </div>

        {/* Footer Section (Signature, Seal, QR Code) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          width: "100%",
          marginTop: "14px",
          padding: "0 10px 4px 10px",
          boxSizing: "border-box"
        }}>
          {/* Signature Area */}
          <div style={{
            textAlign: "center",
            width: "190px",
            paddingTop: "32px",
            position: "relative",
            justifySelf: "start"
          }}>
            {signatureSrc && (
              <img
                src={signatureSrc}
                alt="Director Signature"
                style={{
                  position: "absolute",
                  bottom: "42px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  height: "48px",
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  pointerEvents: "none"
                }}
              />
            )}
            <div style={{ borderTop: "1px solid #333", width: "100%", marginBottom: "5px" }}></div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#222" }}>(Seal & Signature)</span>
            <br />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#333" }}>Director</span>
          </div>

          {/* ISO Seal */}
          <div style={{
            width: "90px",
            height: "90px",
            marginTop: "-10px",
            justifySelf: "center"
          }}>
            <img
              src={isoSealSrc}
              alt="ISO 9001 Seal"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* QR Code */}
          <div style={{
            width: "82px",
            height: "82px",
            border: "2px solid #333",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: "2px",
            justifySelf: "end"
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
          borderTop: "none",
          paddingTop: "2px",
          marginTop: "12px"
        }}>
          <img src={mcaSrc} alt="MCA Govt of India" style={{ height: "72px", maxWidth: "175px", objectFit: "contain" }} />
          <img src={nitiSrc} alt="NITI Aayog" style={{ height: "70px", maxWidth: "135px", objectFit: "contain" }} />
          <img src={nsdcSrc} alt="NSDC" style={{ height: "72px", maxWidth: "150px", objectFit: "contain" }} />
          <img src={emblemSrc} alt="Ministry of Social Justice and Empowerment" style={{ height: "76px", maxWidth: "135px", objectFit: "contain" }} />
          <img src={msmeSrc} alt="MSME Govt of India" style={{ height: "70px", maxWidth: "155px", objectFit: "contain" }} />
        </div>

        {/* Footer Verification text */}
        <div style={{
          fontSize: "9px",
          color: "#cc0000",
          fontWeight: "bold",
          textAlign: "center",
          marginTop: "12px",
          lineHeight: "1.25"
        }}>
          An autonomous skill development diploma issued as an Independent Institutional Certification.
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

  const [
    photoBase64,
    qrBase64,
    logoBase64,
    mcaBase64,
    nitiBase64,
    nsdcBase64,
    msmeBase64,
    emblemBase64,
    isoSealBase64,
    signatureBase64,
    borderBase64
  ] = await Promise.all([
    data.photoUrl ? getBase64ImageFromUrl(data.photoUrl) : Promise.resolve(""),
    getBase64ImageFromUrl(data.qrCodeUrl),
    getBase64ImageFromUrl("/logo.png"),
    getBase64ImageFromUrl("/images/mca.png"),
    getBase64ImageFromUrl("/images/niti aayog.png"),
    getBase64ImageFromUrl("/images/nsdc.png"),
    getBase64ImageFromUrl("/images/msme.png"),
    getBase64ImageFromUrl("/images/ministry of social justice and empowerment.png"),
    getBase64ImageFromUrl("/images/iso.png"),
    getBase64ImageFromUrl("/images/course_director_sig.png"),
    getBase64ImageFromUrl("/images/completion-antique-royal-border-a4.svg")
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
          signatureBase64={signatureBase64}
          borderBase64={borderBase64}
        />
      );

      // Wait 2 seconds to ensure custom web fonts and SVGs are fully parsed and rendered
      setTimeout(async () => {
        try {
          await document.fonts.ready;
          const targetElement = container.firstChild as HTMLElement;
          if (!targetElement) {
            throw new Error("Target element not found in offscreen container");
          }

          const canvas = await html2canvas(targetElement, {
            // CSS renders at 96 DPI; 700 / 96 ≈ 7.29.
            scale: 7.3,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#ffffff",
            imageTimeout: 15000
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "NONE");
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
      }, 400);
    } catch (err) {
      reject(err);
    }
  });
}
