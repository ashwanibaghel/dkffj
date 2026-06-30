const fs = require('fs');
const path = require('path');
const ws = require('ws');
global.WebSocket = ws;
const { createClient } = require('@supabase/supabase-js');
const PDFDocument = require('pdfkit');

// Load environment variables manually
function loadEnv(file) {
  const envPath = path.join(__dirname, '..', file);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv('.env');
loadEnv('.env.local');

function generateCertificatePDF(fullName, enrollmentNo, courseTitle, certNo, dateStr, verificationUrl) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Draw borders
      doc.rect(20, 20, 801.89, 555.28).lineWidth(3).stroke("#0F4C81");
      doc.rect(26, 26, 789.89, 543.28).lineWidth(1).stroke("#D62828");

      // Header Text
      doc.fillColor("#0F4C81")
        .font("Times-Bold")
        .fontSize(28)
        .text("DK FOUNDATION OF FREEDOM AND JUSTICE", 0, 70, { align: "center" });

      doc.fillColor("#D62828")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("REGISTERED UNDER MINISTRY OF CORPORATE AFFAIRS, GOVT OF INDIA", 0, 110, {
          align: "center",
          characterSpacing: 1,
        });

      // Divider line
      doc.moveTo(150, 130).lineTo(691.89, 130).lineWidth(1.5).stroke("#0F4C81");

      // Body text
      doc.fillColor("#333333")
        .font("Times-Italic")
        .fontSize(16)
        .text("This is to certify that", 0, 170, { align: "center" });

      // Student Name
      doc.fillColor("#0F4C81")
        .font("Times-Bold")
        .fontSize(24)
        .text(fullName, 0, 205, { align: "center" });

      // Enrollment Details
      doc.fillColor("#666666")
        .font("Helvetica")
        .fontSize(11)
        .text(`Enrollment Number: ${enrollmentNo}`, 0, 245, { align: "center" });

      doc.fillColor("#333333")
        .font("Times-Italic")
        .fontSize(14)
        .text("has successfully completed all coursework, academic requirements,", 0, 285, { align: "center" });
      doc.text("practical examinations, and training for the certificate program in:", 0, 310, { align: "center" });

      // Course Name
      doc.fillColor("#D62828")
        .font("Times-Bold")
        .fontSize(20)
        .text(courseTitle, 0, 345, { align: "center" });

      // Divider line
      doc.moveTo(250, 385).lineTo(591.89, 385).lineWidth(0.5).stroke("#cccccc");

      // Bottom details
      doc.fillColor("#555555")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`CERTIFICATE NO: ${certNo}`, 100, 430, { width: 300, align: "left" });

      doc.font("Helvetica")
        .fillColor("#666666")
        .text(`DATE OF ISSUE: ${dateStr}`, 100, 455, { width: 300, align: "left" });

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor("#666666")
        .text(`To verify authenticity, scan the QR code or visit:`, 440, 430, { width: 300, align: "right" });
      doc.fillColor("#0F4C81")
        .font("Helvetica-Bold")
        .text(verificationUrl, 440, 450, { width: 300, align: "right", link: verificationUrl });

      // Signatures
      doc.moveTo(100, 510).lineTo(220, 510).lineWidth(1).stroke("#999999");
      doc.fillColor("#555555")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("AUTHORIZED SIGNATORY", 100, 520, { width: 120, align: "center" });

      doc.moveTo(621.89, 510).lineTo(741.89, 510).lineWidth(1).stroke("#999999");
      doc.text("REGISTRAR", 621.89, 520, { width: 120, align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration env variables.");
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("Authenticating as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@dkffj.org',
    password: 'AdminPassword123'
  });
  
  if (authError || !authData.session) {
    throw new Error(`Authentication failed: ${authError?.message}`);
  }
  console.log("Authenticated successfully!");
  
  console.log("Querying registration by enrollment number DKE-2026-00002...");
  const { data: reg, error: regError } = await supabase
    .from("course_registrations")
    .select("*, courses(title)")
    .eq("enrollment_no", "DKE-2026-00002")
    .single();
    
  if (regError || !reg) {
    throw new Error(`Failed to find registration: ${regError?.message}`);
  }
  console.log(`Found registration for: ${reg.full_name}`);
  
  const certNo = "DKCERT-2026-00002";
  const courseTitle = reg.courses?.title || "Selected Course";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.vercel.app";
  const verificationUrl = `${appUrl}/verify/${certNo}`;
  const dateStr = new Date(reg.created_at).toLocaleDateString("en-IN");
  
  console.log("Generating premium PDF...");
  const pdfBuffer = await generateCertificatePDF(
    reg.full_name,
    reg.enrollment_no,
    courseTitle,
    certNo,
    dateStr,
    verificationUrl
  );
  
  const pdfPath = `certs/cert_${certNo}.pdf`;
  console.log(`Uploading PDF to storage at ${pdfPath}...`);
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("certificates")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  console.log("PDF uploaded successfully! URL is: " + supabase.storage.from("certificates").getPublicUrl(pdfPath).data.publicUrl);
}

main()
  .catch(e => console.error(e));
