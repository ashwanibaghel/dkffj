const { Resend } = require("resend");
const resendApiKey = process.env.RESEND_API_KEY || "re_H3tZqFv7_5MmsuU7F36mD12k2D7W4nQjM";
const resend = new Resend(resendApiKey);

async function main() {
  try {
    console.log("Fetching recently sent emails from Resend...");
    
    // Resend API to list emails
    const response = await resend.emails.list();
    
    if (response.error) {
      console.error("Resend API Error:", response.error);
      return;
    }

    console.log(`Found ${response.data.data.length} emails in Resend log:`);
    response.data.data.forEach(e => {
      console.log(` - ID: ${e.id} | Subject: ${e.subject} | To: ${e.to.join(", ")} | Created At: ${e.created_at}`);
    });
  } catch (err) {
    console.error("Diagnostic script crashed:", err);
  }
}

main();
