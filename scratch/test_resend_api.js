const { Resend } = require("resend");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const apiKey = process.env.RESEND_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
console.log("From Email:", process.env.RESEND_FROM_EMAIL);

if (!apiKey) {
  console.error("No RESEND_API_KEY found!");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main() {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DKFFJ <no-reply@mail.dkffj.org>",
      to: "ashwanibaghel9027@gmail.com",
      subject: "Test Resend Email Connection",
      html: "<p>If you receive this, the Resend integration is working perfectly!</p>"
    });
    console.log("Email Sent successfully!");
    console.log(data);
  } catch (error) {
    console.error("Resend API Call Failed:", error);
  }
}

main();
