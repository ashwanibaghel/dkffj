import jsPDF from "jspdf";

export interface AffiliationCertificateConfig {
  layout: "landscape" | "portrait";
  paperSize: "a4";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    textDark: string;
    textMuted: string;
  };
  coordinates: {
    headerY: number;
    titleY: number;
    instituteNameY: number;
    affiliationNoY: number;
    detailsY: number;
    datesY: number;
    qrX: number;
    qrY: number;
    qrSize: number;
  };
}

export const DEFAULT_CERTIFICATE_CONFIG: AffiliationCertificateConfig = {
  layout: "landscape",
  paperSize: "a4",
  colors: {
    primary: "#001C55",
    secondary: "#C00000",
    accent: "#B8860B",
    textDark: "#1E293B",
    textMuted: "#64748B"
  },
  coordinates: {
    headerY: 35,
    titleY: 55,
    instituteNameY: 85,
    affiliationNoY: 105,
    detailsY: 125,
    datesY: 155,
    qrX: 235,
    qrY: 145,
    qrSize: 35
  }
};

export async function generateAffiliationCertificatePDF(
  affiliationData: {
    organizationName: string;
    organizationType: string;
    affiliationNo: string;
    district: string;
    state: string;
    establishmentYear: string;
    validFromStr: string;
    validToStr: string;
    verificationToken: string;
    approvedDomains?: string[];
  },
  config: AffiliationCertificateConfig = DEFAULT_CERTIFICATE_CONFIG
): Promise<Blob> {
  // Create Landscape A4 Document (297mm x 210mm)
  const doc = new jsPDF({
    orientation: config.layout,
    unit: "mm",
    format: config.paperSize
  });

  const width = doc.internal.pageSize.getWidth(); // 297mm
  const height = doc.internal.pageSize.getHeight(); // 210mm

  // Outer Border Frame
  doc.setLineWidth(2);
  doc.setDrawColor(0, 28, 85); // Primary Navy
  doc.rect(8, 8, width - 16, height - 16);

  doc.setLineWidth(0.5);
  doc.setDrawColor(184, 134, 11); // Gold Inner Line
  doc.rect(11, 11, width - 22, height - 22);

  // Top Header Logo / Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 28, 85);
  doc.text("DK FOUNDATION OF FREEDOM AND JUSTICE", width / 2, config.coordinates.headerY, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(192, 0, 0); // Crimson Subtitle
  doc.text("NATIONAL EXECUTIVE BOARD • REGISTERED GOVT AFFILIATION REGISTRY", width / 2, config.coordinates.headerY + 7, { align: "center" });

  // Main Certificate Title
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(184, 134, 11); // Gold Accent
  doc.text("CERTIFICATE OF AFFILIATION", width / 2, config.coordinates.titleY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("This is to officially certify that the educational / training institute named below", width / 2, config.coordinates.titleY + 10, { align: "center" });

  // Institute Name Banner
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 28, 85);
  doc.text(affiliationData.organizationName.toUpperCase(), width / 2, config.coordinates.instituteNameY, { align: "center" });

  // Underline Accent
  doc.setLineWidth(0.8);
  doc.setDrawColor(0, 28, 85);
  doc.line(width / 2 - 60, config.coordinates.instituteNameY + 3, width / 2 + 60, config.coordinates.instituteNameY + 3);

  // Location & Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Located at District ${affiliationData.district}, ${affiliationData.state} (Estd. ${affiliationData.establishmentYear})`,
    width / 2,
    config.coordinates.instituteNameY + 12,
    { align: "center" }
  );

  doc.text(
    `is granted official affiliation as an authorized ${affiliationData.organizationType}`,
    width / 2,
    config.coordinates.instituteNameY + 19,
    { align: "center" }
  );

  // Affiliation Serial Number Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(width / 2 - 50, config.coordinates.affiliationNoY - 6, 100, 12, 3, 3, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 28, 85);
  doc.text(`AFFILIATION NO: ${affiliationData.affiliationNo}`, width / 2, config.coordinates.affiliationNoY + 2, { align: "center" });

  // Validity Dates
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`VALID FROM: ${affiliationData.validFromStr}   TO   ${affiliationData.validToStr}`, width / 2, config.coordinates.datesY, { align: "center" });

  // Approved Domains Line
  if (affiliationData.approvedDomains && affiliationData.approvedDomains.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Authorized Domains: ${affiliationData.approvedDomains.join(" • ")}`, width / 2, config.coordinates.datesY + 8, { align: "center" });
  }

  // QR Code Image (Embedded via URL-safe Token)
  const appUrl = "https://www.dkffj.org";
  const verifyUrl = `${appUrl}/affiliation/verify/${affiliationData.verificationToken}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&ecc=M&data=${encodeURIComponent(verifyUrl)}`;

  try {
    const qrImgBlob = await fetch(qrApiUrl).then((r) => r.arrayBuffer());
    const qrUint8 = new Uint8Array(qrImgBlob);
    doc.addImage(
      qrUint8,
      "PNG",
      config.coordinates.qrX,
      config.coordinates.qrY,
      config.coordinates.qrSize,
      config.coordinates.qrSize
    );
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to Verify Online", config.coordinates.qrX + config.coordinates.qrSize / 2, config.coordinates.qrY + config.coordinates.qrSize + 4, { align: "center" });
  } catch (_) {
    // If QR fetch fails, render placeholder text
    doc.setFontSize(8);
    doc.text("QR Verification Online", config.coordinates.qrX, config.coordinates.qrY + 15);
  }

  // Signature Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 28, 85);
  doc.text("Authorized Signatory", 40, height - 25);
  doc.line(25, height - 30, 75, height - 30);

  doc.text("Chairman / Executive Board", width / 2, height - 25, { align: "center" });
  doc.line(width / 2 - 25, height - 30, width / 2 + 25, height - 30);

  return doc.output("blob");
}
