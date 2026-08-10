import PDFDocument from "pdfkit";
import { NormalizedCourse } from "./courseCatalog";

export interface AnnexurePdfData {
  affiliationNo: string;
  organizationName: string;
  district: string;
  state: string;
  validFrom: string;
  validTo: string;
  approvedCourses: NormalizedCourse[];
}

export async function generateAffiliationAnnexurePdfBuffer(data: AnnexurePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 36, // 0.5 inch margins
        bufferPages: true,
        info: {
          Title: `Annexure-A - ${data.organizationName}`,
          Author: "DK Foundation of Freedom and Justice",
          Subject: "Approved Affiliated Programs List"
        }
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // Outer Navy Border
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)
         .lineWidth(2)
         .strokeColor("#001C55")
         .stroke();

      // Inner Gold Border
      doc.rect(19, 19, pageWidth - 38, pageHeight - 38)
         .lineWidth(1)
         .strokeColor("#D4AF37")
         .stroke();

      // Header Banner
      doc.rect(margin, margin, contentWidth, 55)
         .fill("#001C55");

      doc.fillColor("#FFFFFF")
         .fontSize(16)
         .font("Helvetica-Bold")
         .text("DK FOUNDATION OF FREEDOM AND JUSTICE", margin, margin + 10, { width: contentWidth, align: "center" });

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("#D4AF37")
         .text("Registered Section 8 Non-Profit Organization | Govt of India Recognized", margin, margin + 32, { width: contentWidth, align: "center" });

      // Title Box
      let y = margin + 65;

      doc.fillColor("#001C55")
         .fontSize(14)
         .font("Helvetica-Bold")
         .text("ANNEXURE - A", margin, y, { width: contentWidth, align: "center" });

      y += 18;
      doc.fillColor("#334155")
         .fontSize(10)
         .font("Helvetica-Bold")
         .text("OFFICIAL LIST OF AUTHORIZED & APPROVED COURSES / PROGRAMS", margin, y, { width: contentWidth, align: "center" });

      y += 20;

      // Meta Box Details
      doc.rect(margin, y, contentWidth, 50)
         .fillAndStroke("#F8FAFC", "#CBD5E1");

      doc.fillColor("#091E42")
         .fontSize(9)
         .font("Helvetica-Bold")
         .text(`Institution: `, margin + 10, y + 8, { continued: true })
         .font("Helvetica")
         .text(`${data.organizationName} (${data.district}, ${data.state})`);

      doc.font("Helvetica-Bold")
         .text(`Affiliation No: `, margin + 10, y + 22, { continued: true })
         .font("Helvetica")
         .text(`${data.affiliationNo}`);

      doc.font("Helvetica-Bold")
         .text(`Validity Period: `, margin + 10, y + 36, { continued: true })
         .font("Helvetica")
         .text(`${data.validFrom} to ${data.validTo}`);

      doc.font("Helvetica-Bold")
         .text(`Total Approved Programs: `, margin + 330, y + 22, { continued: true })
         .font("Helvetica")
         .text(`${data.approvedCourses.length}`);

      y += 60;

      // Table Headers
      const colWidths = {
        sno: 30,
        sector: 125,
        topic: 120,
        program: 180,
        type: 68
      };

      doc.rect(margin, y, contentWidth, 22)
         .fill("#001C55");

      doc.fillColor("#FFFFFF")
         .fontSize(8)
         .font("Helvetica-Bold");

      let currentX = margin;
      doc.text("S.No", currentX + 4, y + 7, { width: colWidths.sno, align: "center" });
      currentX += colWidths.sno;

      doc.text("Sector / Discipline", currentX + 4, y + 7, { width: colWidths.sector });
      currentX += colWidths.sector;

      doc.text("Topic / Subject", currentX + 4, y + 7, { width: colWidths.topic });
      currentX += colWidths.topic;

      doc.text("Approved Program Name", currentX + 4, y + 7, { width: colWidths.program });
      currentX += colWidths.program;

      doc.text("Track & Duration", currentX + 4, y + 7, { width: colWidths.type, align: "center" });

      y += 22;

      // Table Rows
      data.approvedCourses.forEach((c, idx) => {
        // Handle page overflow cleanly
        if (y > pageHeight - 110) {
          doc.addPage();

          // Outer / Inner borders on new page
          doc.rect(15, 15, pageWidth - 30, pageHeight - 30).lineWidth(2).strokeColor("#001C55").stroke();
          doc.rect(19, 19, pageWidth - 38, pageHeight - 38).lineWidth(1).strokeColor("#D4AF37").stroke();

          y = margin + 10;
          doc.fillColor("#001C55")
             .fontSize(10)
             .font("Helvetica-Bold")
             .text(`ANNEXURE - A (Contd.) — ${data.organizationName} [${data.affiliationNo}]`, margin, y, { width: contentWidth, align: "center" });
          y += 20;

          // Repeat Header
          doc.rect(margin, y, contentWidth, 20).fill("#001C55");
          doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");

          let rx = margin;
          doc.text("S.No", rx + 4, y + 6, { width: colWidths.sno, align: "center" });
          rx += colWidths.sno;
          doc.text("Sector / Discipline", rx + 4, y + 6, { width: colWidths.sector });
          rx += colWidths.sector;
          doc.text("Topic / Subject", rx + 4, y + 6, { width: colWidths.topic });
          rx += colWidths.topic;
          doc.text("Approved Program Name", rx + 4, y + 6, { width: colWidths.program });
          rx += colWidths.program;
          doc.text("Track & Duration", rx + 4, y + 6, { width: colWidths.type, align: "center" });

          y += 20;
        }

        const bg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
        doc.rect(margin, y, contentWidth, 20).fillAndStroke(bg, "#E2E8F0");

        doc.fillColor("#1E293B").fontSize(7.5).font("Helvetica");

        let cx = margin;
        doc.text(`${idx + 1}`, cx + 4, y + 6, { width: colWidths.sno, align: "center" });
        cx += colWidths.sno;

        doc.text(c.sector, cx + 4, y + 6, { width: colWidths.sector - 8, height: 14 });
        cx += colWidths.sector;

        doc.text(c.topic, cx + 4, y + 6, { width: colWidths.topic - 8, height: 14 });
        cx += colWidths.topic;

        doc.font("Helvetica-Bold").text(c.title, cx + 4, y + 6, { width: colWidths.program - 8, height: 14 }).font("Helvetica");
        cx += colWidths.program;

        const trackLabel = `${c.programType === "DIPLOMA" ? "Diploma" : "Cert."} (${c.duration})`;
        doc.text(trackLabel, cx + 4, y + 6, { width: colWidths.type, align: "center" });

        y += 20;
      });

      // Footer Notice & Signature
      if (y > pageHeight - 90) {
        doc.addPage();
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30).lineWidth(2).strokeColor("#001C55").stroke();
        doc.rect(19, 19, pageWidth - 38, pageHeight - 38).lineWidth(1).strokeColor("#D4AF37").stroke();
        y = margin + 20;
      } else {
        y += 15;
      }

      doc.rect(margin, y, contentWidth, 40).fillAndStroke("#F1F5F9", "#CBD5E1");

      doc.fillColor("#0F172A")
         .fontSize(8)
         .font("Helvetica-Bold")
         .text("IMPORTANT NOTICE & LEGAL DISCLAIMER:", margin + 8, y + 6);

      doc.font("Helvetica")
         .fontSize(7.5)
         .fillColor("#334155")
         .text(
           `This Annexure forms an integral part of Affiliation Certificate ${data.affiliationNo}. The institution is authorized to conduct training, admit students, and issue DKFFJ verification requests ONLY for the programs explicitly listed herein. Any unlisted course offered by the institute will be deemed unauthorized.`,
           margin + 8,
           y + 17,
           { width: contentWidth - 16 }
         );

      y += 50;

      // CEO Signature block
      doc.fillColor("#001C55")
         .fontSize(9)
         .font("Helvetica-Bold")
         .text("For DK Foundation of Freedom and Justice", margin, y, { width: contentWidth, align: "right" });

      y += 25;
      doc.fillColor("#475569")
         .fontSize(8)
         .font("Helvetica")
         .text("Authorized Signatory & Competent Authority", margin, y, { width: contentWidth, align: "right" });

      // Add page numbering footer to all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor("#64748B")
           .fontSize(7.5)
           .font("Helvetica")
           .text(`Page ${i + 1} of ${range.count}  |  Official Annexure-A  |  Affiliation No: ${data.affiliationNo}`, margin, pageHeight - 25, {
             width: contentWidth,
             align: "center"
           });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
