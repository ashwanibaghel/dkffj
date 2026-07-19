const { Resend } = require("resend");
require("dotenv").config({ path: ".env" });

const resendApiKey = process.env.RESEND_API_KEY;
console.log("Resend Key:", resendApiKey ? resendApiKey.substring(0, 10) + "..." : "undefined");

const resend = new Resend(resendApiKey);

async function main() {
  console.log("Testing sending from info@dkffj.org...");
  try {
    const data = await resend.emails.send({
      from: "DKFFJ <info@dkffj.org>",
      to: "ashwanibaghel9027@gmail.com",
      subject: `Official Graduation Certificate Issued - Domain Verification Test`,
      html: "<p>This is a test.</p>"
    });
    console.log("Response:", data);
  } catch (err) {
    console.error("Resend send failed:", err);
  }
}

main();
