const fs = require('fs');
const path = require('path');
const https = require('https');
const PDFDocument = require('pdfkit');

// Ensure folder exists
const scratchDir = __dirname;

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

async function run() {
  console.log("Generating sample certificate...");
  
  const templatePath = path.join(__dirname, '..', 'public', 'images', 'certificate_template.jpg');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found at: ${templatePath}`);
    process.exit(1);
  }

  // URLs for mockup images
  const avatarUrl = "https://avatar.iran.liara.run/public/boy";
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://dkffj.org/verify/DKCERT-2026-00002";

  console.log("Downloading mockup photo and QR code...");
  let photoBuffer, qrBuffer;
  try {
    photoBuffer = await downloadBuffer(avatarUrl);
    console.log("Mock photo downloaded.");
  } catch (err) {
    console.warn("Could not download mock photo, using fallback:", err.message);
  }

  try {
    qrBuffer = await downloadBuffer(qrUrl);
    console.log("Mock QR code downloaded.");
  } catch (err) {
    console.warn("Could not download mock QR code, using fallback:", err.message);
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

  // Create PDF
  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 0,
  });

  const outputFilename = "sample_certificate.pdf";
  
  // Save to both public/ and artifacts/
  const publicOutputPath = path.join(__dirname, '..', 'public', outputFilename);
  const artifactOutputPath = path.join("C:/Users/ashwa/.gemini/antigravity/brain/35e9745f-4d5d-4f35-8493-86a8e7f51280", outputFilename);

  const writeStream = fs.createWriteStream(publicOutputPath);
  doc.pipe(writeStream);

  // Draw background template
  doc.image(templatePath, 0, 0, { width: 595.28, height: 841.89 });

  // 1. Mask photo box placeholder with rounded rectangle
  doc.fillColor("#ffffff").roundedRect(445, 130, 105, 135, 10).fill();

  // Draw student photo (clipped to rounded rectangle)
  if (photoBuffer) {
    doc.save();
    doc.roundedRect(445, 130, 105, 135, 10).clip();
    doc.image(photoBuffer, 445, 130, { width: 105, height: 135 });
    doc.restore();
  }

  // Draw border
  doc.roundedRect(445, 130, 105, 135, 10).lineWidth(0.5).stroke("#cccccc");

  // 2. Mask placeholder QR code at actual template position (Y = 618)
  doc.fillColor("#ffffff").rect(462, 618, 80, 80).fill();

  // Draw QR code
  if (qrBuffer) {
    doc.image(qrBuffer, 462, 618, { width: 80, height: 80 });
  }

  // Student's Name
  doc.fillColor("#0F4C81")
    .font("Times-Bold")
    .fontSize(14)
    .text(fullName, 230, 295, { width: 320, align: "center" });

  // Father's Name
  doc.fillColor("#0F4C81")
    .font("Times-Bold")
    .fontSize(14)
    .text(fatherName, 180, 336, { width: 370, align: "center" });

  // Course Title
  doc.fillColor("#0F4C81")
    .font("Times-Bold")
    .fontSize(12)
    .text(courseTitle, 265, 377, { width: 285, align: "center" });

  // Conducted by our institution
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("DK Foundation of Freedom and Justice", 230, 418, { width: 320, align: "center" });

  // Duration From and To (Row 5 - Y = 438)
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(durationFrom, 195, 438, { width: 165, align: "center" });

  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(durationTo, 395, 438, { width: 155, align: "center" });

  // Grade/Percentage (Row 6 - Y = 458)
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(grade, 165, 458, { width: 80, align: "center" });

  // Training Venue (Row 6 - Y = 458)
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(venue, 360, 458, { width: 190, align: "center" });

  // Performance (Row 7 - Y = 499)
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(performance, 405, 499, { width: 120, align: "center" });

  // Mask placeholders on the background template (Row 8 - Y = 537)
  doc.fillColor("#ffffff").rect(170, 533, 110, 15).fill();
  doc.fillColor("#ffffff").rect(420, 533, 110, 15).fill();

  // Certificate No (Row 8 - Y = 537)
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(certNo, 170, 535, { width: 110, align: "left" });

  // Date of Issue (Row 8 - Y = 537)
  doc.fillColor("#0F4C81")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(dateStr, 420, 535, { width: 110, align: "left" });

  doc.end();

  writeStream.on('finish', () => {
    console.log(`Successfully generated public sample at: ${publicOutputPath}`);
    
    // Copy to artifact directory
    fs.mkdirSync(path.dirname(artifactOutputPath), { recursive: true });
    fs.copyFileSync(publicOutputPath, artifactOutputPath);
    console.log(`Successfully copied to artifacts at: ${artifactOutputPath}`);
  });
}

run().catch(console.error);
