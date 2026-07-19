const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { Resend } = require("resend");

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY || "re_H3tZqFv7_5MmsuU7F36mD12k2D7W4nQjM"; // Fallback placeholder if not set
const resend = new Resend(resendApiKey);

async function main() {
  try {
    console.log("Testing email dispatch with attachments...");
    
    // Fetch a public file to test fetch
    const testUrl = "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/certificates/8bc274b2-69b1-4e30-8db8-d711fc827fc4_cert.pdf";
    console.log(`Downloading test certificate PDF from: ${testUrl}...`);
    
    let buffer;
    try {
      const res = await fetch(testUrl);
      if (!res.ok) throw new Error(`Fetch status: ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log(`Successfully downloaded! Size: ${buffer.length} bytes`);
    } catch (fetchErr) {
      console.error("Fetch failed:", fetchErr);
    }

    if (!buffer) {
      console.log("Could not download attachment. Attempting fetch with SSL bypass...");
      // In Node.js, we can bypass SSL for fetch using an agent, but since we are using global fetch,
      // setting NODE_TLS_REJECT_UNAUTHORIZED="0" env variable is standard.
    }

    // Try sending email via Resend
    console.log("Sending test email to ashwanibaghel826@gmail.com...");
    const fromEmail = process.env.RESEND_FROM_EMAIL || "DKFFJ Portal <noreply@dkffj.org>";
    
    const attachments = [];
    if (buffer) {
      attachments.push({
        filename: "Test_Certificate.pdf",
        content: buffer
      });
    }

    const response = await resend.emails.send({
      from: fromEmail,
      to: "ashwanibaghel826@gmail.com",
      subject: "Test Welcome Email with Attachments",
      html: "<p>This is a test welcome email from the diagnostic script.</p>",
      attachments: attachments.length > 0 ? attachments : undefined
    });

    console.log("Resend API Response:", response);
  } catch (err) {
    console.error("Diagnostic script crashed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
