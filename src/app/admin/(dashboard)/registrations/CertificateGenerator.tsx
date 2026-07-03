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
        backgroundColor: "#fcf9f2", // Warm premium ivory background
        fontFamily: "'Playfair Display', Georgia, serif",
        boxSizing: "border-box",
        overflow: "hidden",
        padding: "35px"
      }}
    >
      {/* Google Fonts injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@600;700;800&family=UnifrakturMaguntia&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=Inter:wght@400;600;700&display=swap');
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
          gap: "8px",
          padding: "20px 0",
          boxSizing: "border-box",
          opacity: 0.07,
          userSelect: "none"
        }}
      >
        {Array.from({ length: 75 }).map((_, i) => (
          <div
            key={i}
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              fontSize: "7px",
              color: "#001C55",
              whiteSpace: "nowrap",
              letterSpacing: "1px",
              width: "100%",
              textAlign: "center"
            }}
          >
            {"DK FOUNDATION OF FREEDOM AND JUSTICE   ".repeat(5)}
          </div>
        ))}
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
        {/* Outer gold border line */}
        <rect x="16" y="16" width="762" height="1091" fill="none" stroke="#c5a880" strokeWidth="5" />
        
        {/* Inner thin red border line */}
        <rect x="24" y="24" width="746" height="1075" fill="none" stroke="#a21e1e" strokeWidth="2" />
        
        {/* Gold dots border line */}
        <rect x="30" y="30" width="734" height="1063" fill="none" stroke="#c5a880" strokeWidth="1" strokeDasharray="3,6" />

        {/* Symmetrical Vector Corner Ornaments (Top Left) */}
        <g transform="translate(35, 35)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Top Right) */}
        <g transform="translate(759, 35) scale(-1, 1)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Bottom Left) */}
        <g transform="translate(35, 1088) scale(1, -1)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
        
        {/* Corner Ornaments (Bottom Right) */}
        <g transform="translate(759, 1088) scale(-1, -1)">
          <path d="M 0 0 L 50 0 L 50 6 L 6 6 L 6 50 L 0 50 Z" fill="#a21e1e" />
          <path d="M 10 10 L 40 10 L 40 13 L 13 13 L 13 40 L 10 40 Z" fill="#c5a880" />
          <circle cx="5" cy="5" r="2.5" fill="#c5a880" />
        </g>
      </svg>

      {/* Certificate Content wrapper */}
      <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Top Header */}
        <div style={{ marginTop: "25px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: "24px",
            color: "#a21e1e",
            letterSpacing: "1px",
            margin: 0
          }}>
            DK FOUNDATION OF FREEDOM AND JUSTICE
          </h1>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "12px",
            color: "#333333",
            margin: "4px 0 0 0"
          }}>
            (Under Section 8 of The Companies Act, 2013 Govt of India)
          </p>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "10px",
            color: "#555555",
            letterSpacing: "0.5px",
            margin: "2px 0 0 0"
          }}>
            CIN No. U88900UP2023NPL185611
          </p>
        </div>

        {/* Crest Logo (Using transparent high-quality logo.png) */}
        <div style={{ marginTop: "12px" }}>
          <img
            src={logoSrc}
            alt="Crest Logo"
            style={{ width: "90px", height: "90px", objectFit: "contain" }}
          />
        </div>

        {/* Title */}
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'UnifrakturMaguntia', serif",
            fontSize: "52px",
            color: "#a21e1e",
            fontWeight: "normal",
            margin: 0
          }}>
            Certificate Of Completion
          </h2>
        </div>



        {/* Helper Style for Pills (Redefined as traditional fill-in lines) */}
        <style>{`
          .cert-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            border: none;
            border-bottom: 1.5px solid #c5a880;
            border-radius: 0;
            color: #001C55;
            font-weight: bold;
            font-size: 16px;
            height: 28px;
            box-shadow: none;
            padding: 0 10px;
          }
          .cert-line {
            display: flex;
            align-items: center;
            width: 90%;
            margin-left: 5%;
            font-size: 15px;
            color: #222222;
            font-style: italic;
          }
        `}</style>

        {/* Form Fields (Dynamic Rows) */}
        <div style={{ width: "100%", marginTop: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Two-Column Section for Name/Father/Course on Left, Student Photo on Right */}
          <div style={{ width: "90%", marginLeft: "5%", display: "flex", gap: "25px", alignItems: "flex-start" }}>
            
            {/* Left Column: Certification details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Row 1: Student Name */}
              <div className="cert-line" style={{ width: "100%", marginLeft: 0 }}>
                <span style={{ minWidth: "190px" }}>This is to certify that Mr./Ms.</span>
                <div className="cert-pill" style={{ flex: 1, textTransform: "uppercase" }}>
                  {data.studentName}
                </div>
              </div>

              {/* Row 2: Father Name */}
              <div className="cert-line" style={{ width: "100%", marginLeft: 0 }}>
                <span style={{ minWidth: "150px" }}>Son/Daughter of Mr.</span>
                <div className="cert-pill" style={{ flex: 1 }}>
                  {data.fatherName}
                </div>
              </div>

              {/* Row 3: Course Title */}
              <div className="cert-line" style={{ width: "100%", marginLeft: 0 }}>
                <span style={{ minWidth: "205px" }}>has successfully completed the</span>
                <div className="cert-pill" style={{ flex: 1 }}>
                  {data.courseTitle}
                </div>
              </div>
            </div>

            {/* Right Column: Student Photo */}
            {photoSrc && (
              <div
                style={{
                  width: "105px",
                  height: "135px",
                  overflow: "hidden",
                  borderRadius: "6px",
                  border: "2px solid #c5a880",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                  flexShrink: 0,
                  marginTop: "6px"
                }}
              >
                <img
                  src={photoSrc}
                  alt="Student Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          {/* Row 4: Institution */}
          <div className="cert-line">
            <span style={{ minWidth: "185px" }}>Conducted by our institution</span>
            <div className="cert-pill" style={{ flex: 1 }}>
              DK Foundation of Freedom and Justice
            </div>
          </div>

          {/* Row 5: Duration From / To */}
          <div className="cert-line">
            <span style={{ minWidth: "155px" }}>Course Duration: From</span>
            <div className="cert-pill" style={{ width: "195px" }}>
              {data.durationFrom}
            </div>
            <span style={{ margin: "0 10px", textAlign: "center", minWidth: "25px" }}>to</span>
            <div className="cert-pill" style={{ flex: 1 }}>
              {data.durationTo}
            </div>
          </div>

          {/* Row 6: Grade / Venue */}
          <div className="cert-line">
            <span style={{ minWidth: "135px" }}>Grade/Percentage:</span>
            <div className="cert-pill" style={{ width: "105px" }}>
              {data.grade}
            </div>
            <span style={{ margin: "0 10px 0 15px", minWidth: "110px" }}>Training Venue:</span>
            <div className="cert-pill" style={{ flex: 1 }}>
              {data.venue}
            </div>
          </div>

          {/* Row 7: Performance */}
          <div className="cert-line">
            <span style={{ minWidth: "410px" }}>During this period, his/her performance and conduct were found to be</span>
            <div className="cert-pill" style={{ flex: 1 }}>
              {data.performance}
            </div>
            <span style={{ marginLeft: "5px" }}>.</span>
          </div>

          {/* Row 8: Wish Line */}
          <div style={{
            textAlign: "center",
            width: "100%",
            fontSize: "15px",
            fontStyle: "italic",
            color: "#222222",
            marginTop: "5px"
          }}>
            We wish him/her every success in all future endeavors.
          </div>
        </div>

        {/* Bottom Metadata Panel */}
        <div style={{
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "35px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#333333"
        }}>
          <div>
            Certificate No: <span style={{ color: "#a21e1e", fontFamily: "monospace" }}>{data.certNo}</span>
          </div>
          <div>
            Date of Issue: <span style={{ color: "#a21e1e" }}>{data.dateStr}</span>
          </div>
        </div>

        {/* Signatures, Seal and QR Code Area */}
        <div style={{
          width: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "15px"
        }}>
          {/* Signatory (Left) */}
          <div style={{ width: "230px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ height: "45px" }} />
            <div style={{ borderTop: "1.5px solid #555555", width: "100%", margin: "5px 0" }} />
            <p style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "10px",
              fontWeight: "bold",
              color: "#333333",
              margin: 0
            }}>
              (Seal & Signature)
            </p>
            <p style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "9px",
              color: "#555555",
              margin: "2px 0 0 0"
            }}>
              Director / Authorized Signatory
            </p>
          </div>

          {/* High-Resolution Gold/Black Ribbon ISO 9001 Seal (Center) */}
          <div style={{ width: "100px", height: "130px", marginTop: "-30px", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src={isoSealSrc}
              alt="ISO 9001 Seal"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Verification QR Code (Right Column, matching 230px width for perfect centering) */}
          <div style={{ width: "230px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <div style={{
              width: "85px",
              height: "85px",
              border: "1px solid #cccccc",
              padding: "2px",
              backgroundColor: "#ffffff"
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

        {/* Footer Logo Band (Direct, high quality vector SVGs and clean PNGs) */}
        <div style={{
          marginTop: "35px",
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#fcfcfc",
          padding: "8px 20px",
          borderRadius: "8px",
          border: "1px solid #e2dcd0"
        }}>
          {/* MCA Logo (High Res PNG) */}
          <img
            src={mcaSrc}
            alt="Ministry of Corporate Affairs"
            style={{ height: "42px", maxWidth: "150px", objectFit: "contain" }}
          />
          {/* NITI Aayog (High Res PNG) */}
          <img
            src={nitiSrc}
            alt="NITI Aayog"
            style={{ height: "40px", maxWidth: "90px", objectFit: "contain" }}
          />
          {/* NSDC (High Res PNG) */}
          <img
            src={nsdcSrc}
            alt="NSDC"
            style={{ height: "42px", maxWidth: "95px", objectFit: "contain" }}
          />
          {/* State Emblem of India (High Res PNG) */}
          <img
            src={emblemSrc}
            alt="State Emblem of India"
            style={{ height: "45px", maxWidth: "55px", objectFit: "contain" }}
          />
          {/* MSME Logo (High Res PNG) */}
          <img
            src={msmeSrc}
            alt="Ministry of MSME"
            style={{ height: "40px", maxWidth: "110px", objectFit: "contain" }}
          />
        </div>

        {/* Verify Footer Link */}
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <p style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "8.5px",
            color: "#666666",
            margin: 0
          }}>
            An Internationally Approved Certification Body by UK Acknowledging Company Ltd.
          </p>
          <p style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            fontWeight: "bold",
            color: "#a21e1e",
            margin: "2px 0 0 0",
            letterSpacing: "0.2px"
          }}>
            Verify this certificate online on www.dkffj.org
          </p>
        </div>

      </div>
    </div>
  );
};

// Generates the PDF using html2canvas and jsPDF, returns the file blob
export async function generateCertificatePDFClient(
  data: CertificateData
): Promise<Blob> {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

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
            backgroundColor: "#fcf9f2"
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.98);

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
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
