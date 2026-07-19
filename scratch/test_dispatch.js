const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { Resend } = require("resend");

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY || "re_A9yi6255_JEhKHYpcRUmY1PUxm5gkdRPu";
const resend = new Resend(resendApiKey);

async function downloadFileToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  try {
    const memberId = "8bc274b2-69b1-4e30-8db8-d711fc827fc4"; // ACK-2026-00006 ID
    console.log(`Locating member record with ID: ${memberId}...`);
    
    const member = await prisma.memberships.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      console.error("Member not found in database.");
      return;
    }

    console.log(`Found member: ${member.full_name} | Email: ${member.email}`);
    
    // Simulate attachments payload
    const attachmentsPayload = {
      certPdfUrl: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/certificates/8bc274b2-69b1-4e30-8db8-d711fc827fc4_cert.pdf",
      certPngUrl: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/certificates/8bc274b2-69b1-4e30-8db8-d711fc827fc4_cert.png",
      idCardPdfUrl: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/id_cards/8bc274b2-69b1-4e30-8db8-d711fc827fc4_id.pdf",
      idCardPngUrl: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/id_cards/8bc274b2-69b1-4e30-8db8-d711fc827fc4_id.png"
    };

    console.log("Downloading attachments...");
    const attachments = [];
    const namePrefix = member.full_name ? member.full_name.replace(/\s+/g, "_") : "Member";

    try {
      const buf = await downloadFileToBuffer(attachmentsPayload.certPdfUrl);
      attachments.push({ filename: `${namePrefix}_Certificate.pdf`, content: buf });
      console.log(`Downloaded certPdf: ${buf.length} bytes`);
    } catch (e) {
      console.error("Failed to download certPdf:", e.message);
    }

    try {
      const buf = await downloadFileToBuffer(attachmentsPayload.certPngUrl);
      attachments.push({ filename: `${namePrefix}_Certificate.png`, content: buf });
      console.log(`Downloaded certPng: ${buf.length} bytes`);
    } catch (e) {
      console.error("Failed to download certPng:", e.message);
    }

    try {
      const buf = await downloadFileToBuffer(attachmentsPayload.idCardPdfUrl);
      attachments.push({ filename: `${namePrefix}_ID_Card.pdf`, content: buf });
      console.log(`Downloaded idCardPdf: ${buf.length} bytes`);
    } catch (e) {
      console.error("Failed to download idCardPdf:", e.message);
    }

    try {
      const buf = await downloadFileToBuffer(attachmentsPayload.idCardPngUrl);
      attachments.push({ filename: `${namePrefix}_ID_Card.png`, content: buf });
      console.log(`Downloaded idCardPng: ${buf.length} bytes`);
    } catch (e) {
      console.error("Failed to download idCardPng:", e.message);
    }

    console.log(`Sending email to ${member.email} with ${attachments.length} attachments...`);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "DKFFJ <no-reply@mail.dkffj.org>";
    
    const emailRes = await resend.emails.send({
      from: fromEmail,
      to: member.email,
      subject: "Welcome to DK Foundation of Freedom & Justice",
      html: "<p>Welcome test email with full attachments.</p>",
      attachments: attachments.length > 0 ? attachments : undefined
    });

    console.log("Email dispatch response:", emailRes);
  } catch (err) {
    console.error("Dispatch script failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
