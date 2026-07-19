import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== "re_placeholder" ? new Resend(resendApiKey) : null;

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{ filename: string; content: Buffer }>
) {
  if (!resend) {
    console.log("----------------------------------------");
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${htmlContent}`);
    if (attachments) {
      console.log(`Attachments: ${attachments.map(a => a.filename).join(", ")}`);
    }
    console.log("----------------------------------------");
    return { success: true, mock: true };
  }

  try {
    let fromEmail = process.env.RESEND_FROM_EMAIL || "DKFFJ <no-reply@mail.dkffj.org>";
    // Secure fallback: If configured sender is unverified root domain, override it to the verified mail subdomain
    if (fromEmail.includes("info@dkffj.org") || !fromEmail.includes("mail.dkffj.org")) {
      fromEmail = "DKFFJ <no-reply@mail.dkffj.org>";
    }

    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
      attachments: attachments || undefined,
    });

    if (response.error) {
      console.error("Resend API returned email error:", response.error);
      return { success: false, error: response.error.message || "Failed to deliver email through Resend API." };
    }

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Email exception caught:", error.message);
    return { success: false, error: error.message };
  }
}
