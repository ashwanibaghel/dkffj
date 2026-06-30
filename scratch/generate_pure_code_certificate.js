const fs = require('fs');
const path = require('path');
const https = require('https');
const PDFDocument = require('pdfkit');

// Download helper to get buffer
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${res.statusCode}`));
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

// Draw elegant custom geometric corners (Red)
function drawCornerDecoration(doc, x, y, width, height, strokeColor) {
  doc.save();
  doc.strokeColor(strokeColor).lineWidth(2);
  
  // Top-Left corner decoration
  doc.moveTo(x, y + 20).lineTo(x, y).lineTo(x + 20, y);
  doc.moveTo(x + 5, y + 25).lineTo(x + 5, y + 5).lineTo(x + 25, y + 5);
  doc.stroke();
  
  // Top-Right corner decoration
  doc.moveTo(x + width - 20, y).lineTo(x + width, y).lineTo(x + width, y + 20);
  doc.moveTo(x + width - 25, y + 5).lineTo(x + width - 5, y + 5).lineTo(x + width - 5, y + 25);
  doc.stroke();
  
  // Bottom-Left corner decoration
  doc.moveTo(x, y + height - 20).lineTo(x, y + height).lineTo(x + 20, y + height);
  doc.moveTo(x + 5, y + height - 25).lineTo(x + 5, y + height - 5).lineTo(x + 25, y + height - 5);
  doc.stroke();
  
  // Bottom-Right corner decoration
  doc.moveTo(x + width - 20, y + height).lineTo(x + width, y + height).lineTo(x + width, y + height - 20);
  doc.moveTo(x + width - 25, y + height - 5).lineTo(x + width - 5, y + height - 5).lineTo(x + width - 5, y + height - 25);
  doc.stroke();
  
  doc.restore();
}

async function run() {
  console.log("Generating pure programmatic code certificate exactly matching original style...");

  // Mockup URLs
  const avatarUrl = "https://avatar.iran.liara.run/public/boy";
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dkffj.org/verify/DKCERT-2026-00002";

  console.log("Downloading mockup photo and QR code...");
  let photoBuffer, qrBuffer;
  try {
    photoBuffer = await downloadBuffer(avatarUrl);
    console.log("Mock photo downloaded successfully.");
  } catch (err) {
    console.warn("Could not download mock photo:", err.message);
  }

  try {
    qrBuffer = await downloadBuffer(qrUrl);
    console.log("Mock QR code downloaded successfully.");
  } catch (err) {
    console.warn("Could not download mock QR code:", err.message);
  }

  // Values
  const fullName = "Ashwani Baghel";
  const fatherName = "Suresh Baghel";
  const courseTitle = "Human Rights Law & Advocacy";
  const certNo = "DKCERT-2026-00002";
  const dateStr = "14/06/2026";
  const durationFrom = "14/06/2026";
  const durationTo = "14/09/2026";
  const grade = "A+";
  const venue = "Online (DKFFJ Portal)";
  const performance = "Outstanding";

  // Create PDF Document (A4 portrait size: 595.28 x 841.89)
  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 0,
  });

  const outputFilename = "pure_code_certificate.pdf";
  const publicOutputPath = path.join(__dirname, '..', 'public', outputFilename);
  const artifactOutputPath = path.join("C:/Users/ashwa/.gemini/antigravity/brain/35e9745f-4d5d-4f35-8493-86a8e7f51280", outputFilename);

  const writeStream = fs.createWriteStream(publicOutputPath);
  doc.pipe(writeStream);

  // Background white fill
  doc.rect(0, 0, 595.28, 841.89).fill("#ffffff");

  // 1. Draw elegant nested borders
  // Outer Thick Red Border
  doc.rect(20, 20, 555.28, 801.89).lineWidth(5).stroke("#D62828");
  // Inner Thin Blue Border
  doc.rect(28, 28, 539.28, 785.89).lineWidth(1.5).stroke("#0F4C81");
  // Geometric corner brackets
  drawCornerDecoration(doc, 28, 28, 539.28, 785.89, "#D62828");

  // 2. Draw circular emblem logo at top center
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 262, 45, { width: 70 });
  } else {
    // Fallback logo circle
    doc.circle(297, 80, 35).fill("#0F4C81");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("DK", 280, 72, { width: 34, align: "center" });
  }

  // 3. Organization Header Text (Slightly smaller 15pt to avoid photo box overlaps)
  doc.fillColor("#0F4C81")
    .font("Times-Bold")
    .fontSize(15)
    .text("DK FOUNDATION OF FREEDOM AND JUSTICE", 0, 125, { align: "center" });

  doc.fillColor("#555555")
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("(Under Section 8 of The Companies Act, 2013 Govt of India)", 0, 145, { align: "center" });

  doc.fillColor("#777777")
    .font("Helvetica")
    .fontSize(8)
    .text("CIN No. U88900UP2023NPL185611", 0, 157, { align: "center" });

  // 4. Main Certificate Title (Red color, matches template)
  doc.fillColor("#D62828")
    .font("Times-Bold")
    .fontSize(22)
    .text("Certificate Of Completion", 0, 182, { align: "center" });

  // 5. Student Profile Photo box (Top Right - Y=130 to match original template)
  doc.fillColor("#ffffff").roundedRect(445, 130, 105, 135, 10).fill();
  if (photoBuffer) {
    doc.save();
    doc.roundedRect(445, 130, 105, 135, 10).clip();
    doc.image(photoBuffer, 445, 130, { width: 105, height: 135 });
    doc.restore();
  } else {
    doc.fillColor("#cccccc").font("Helvetica").fontSize(9).text("Student Photo", 445, 192, { width: 105, align: "center" });
  }
  doc.roundedRect(445, 130, 105, 135, 10).lineWidth(0.5).stroke("#cccccc");

  // 6. Sentence Structure with Programmatic Bubbles (Matches JPEG exactly)
  
  // Row 1: Student Name bubble
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("This is to certify that Mr./Ms.", 60, 240);
  doc.roundedRect(230, 233, 305, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Times-Bold").fontSize(13).text(fullName, 230, 238, { width: 305, align: "center" });

  // Row 2: Father Name bubble
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("Son/Daughter of Mr.", 60, 280);
  doc.roundedRect(180, 273, 355, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Times-Bold").fontSize(13).text(fatherName, 180, 278, { width: 355, align: "center" });

  // Row 3: Course Title bubble
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("has successfully completed the", 60, 320);
  doc.roundedRect(265, 313, 270, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#D62828").font("Times-Bold").fontSize(11).text(courseTitle, 265, 318, { width: 270, align: "center" });

  // Row 4: Institution bubble
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("conducted by our institution", 60, 360);
  doc.roundedRect(230, 353, 305, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Helvetica-Bold").fontSize(10).text("DK Foundation of Freedom and Justice", 230, 359, { width: 305, align: "center" });

  // Row 5: Duration bubbles (From & To)
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("Course Duration: From", 60, 400);
  doc.roundedRect(195, 393, 165, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Helvetica-Bold").fontSize(11).text(durationFrom, 195, 399, { width: 165, align: "center" });

  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("to", 370, 400);
  doc.roundedRect(395, 393, 140, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Helvetica-Bold").fontSize(11).text(durationTo, 395, 399, { width: 140, align: "center" });

  // Row 6: Grade & Venue bubbles
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("Grade/Percentage:", 60, 440);
  doc.roundedRect(165, 433, 80, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Helvetica-Bold").fontSize(11).text(grade, 165, 439, { width: 80, align: "center" });

  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("Training venue:", 260, 440);
  doc.roundedRect(360, 433, 175, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Helvetica-Bold").fontSize(10).text(venue, 360, 439, { width: 175, align: "center" });

  // Row 7: Performance bubble
  doc.fillColor("#333333").font("Times-Italic").fontSize(12).text("During this period, his/her performance and conduct were found", 60, 480);
  doc.roundedRect(405, 473, 130, 22, 10).fillAndStroke("#ffffff", "#cccccc").lineWidth(0.8);
  doc.fillColor("#0F4C81").font("Helvetica-Bold").fontSize(11).text(performance, 405, 479, { width: 130, align: "center" });

  // Row 8: Success Text
  doc.fillColor("#333333")
    .font("Times-Italic")
    .fontSize(13)
    .text("We wish him/her every success in all future endeavors.", 0, 525, { align: "center" });

  // Row 9: Credentials line (No table box, exactly like template)
  doc.fillColor("#555555").font("Helvetica-Bold").fontSize(10);
  doc.text("Certificate No: ", 60, 565, { continued: true });
  doc.fillColor("#0F4C81").font("Helvetica-Bold").text(certNo);

  doc.fillColor("#555555").font("Helvetica-Bold").fontSize(10);
  doc.text("Date of Issue: ", 360, 565, { continued: true });
  doc.fillColor("#0F4C81").font("Helvetica-Bold").text(dateStr);

  // 7. QR Code Placement (Y = 618, X = 450)
  if (qrBuffer) {
    doc.image(qrBuffer, 450, 618, { width: 85, height: 85 });
  } else {
    doc.rect(450, 618, 85, 85).lineWidth(0.5).stroke("#cccccc");
  }

  // 8. Programmatic Golden Seal (Bottom Center)
  doc.save();
  doc.circle(297, 665, 30).fill("#D4AF37");
  doc.circle(297, 665, 30).lineWidth(1.5).stroke("#996515");
  doc.circle(297, 665, 26).lineWidth(0.5).dash(3, { space: 2 }).stroke("#996515");
  doc.fillColor("#996515").font("Helvetica-Bold").fontSize(7);
  doc.text("DKFFJ", 270, 655, { width: 54, align: "center" });
  doc.text("VERIFIED", 270, 668, { width: 54, align: "center" });
  doc.restore();

  // 9. Director Signature Line
  doc.moveTo(60, 715).lineTo(210, 715).lineWidth(1).stroke("#0F4C81");
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("Director / Authorized Signatory", 60, 725, { width: 150, align: "center" });

  // Verification Website Link (Very Bottom)
  doc.fillColor("#777777")
    .font("Helvetica")
    .fontSize(8)
    .text("Verify this certificate online at www.dkffj.org", 0, 785, { align: "center" });

  doc.end();

  writeStream.on('finish', () => {
    console.log(`Successfully generated programmatic public sample at: ${publicOutputPath}`);
    
    // Copy to artifact directory
    fs.mkdirSync(path.dirname(artifactOutputPath), { recursive: true });
    fs.copyFileSync(publicOutputPath, artifactOutputPath);
    console.log(`Successfully copied programmatic to artifacts at: ${artifactOutputPath}`);
  });
}

run().catch(console.error);
