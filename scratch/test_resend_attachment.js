const { Resend } = require("resend");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const resendApiKey = process.env.RESEND_API_KEY;
console.log("Resend Key:", resendApiKey ? resendApiKey.substring(0, 10) + "..." : "undefined");

const resend = new Resend(resendApiKey);

async function main() {
  const pdfBuffer = Buffer.from("Mock PDF content");
  const pngBuffer = Buffer.from("Mock PNG content");

  console.log("Sending email via Resend...");
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DKFFJ <no-reply@mail.dkffj.org>",
      to: "ashwanibaghel9027@gmail.com",
      subject: `Official Graduation Certificate Issued - Attachment Test`,
      html: "<p>This is a test certificate attachment email.</p>",
      attachments: [
        { filename: `DKCERT-2026-99999.pdf`, content: pdfBuffer },
        { filename: `DKCERT-2026-99999.png`, content: pngBuffer }
      ]
    });
    console.log("Sent successfully with attachments!");
    console.log(data);
  } catch (err) {
    console.error("Failed to send email with attachments:", err);
  }
}

main();
