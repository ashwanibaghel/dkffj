import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== "re_placeholder" ? new Resend(resendApiKey) : null;

export async function sendTransactionalEmail(to: string, subject: string, htmlContent: string) {
  if (!resend) {
    console.log("----------------------------------------");
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${htmlContent}`);
    console.log("----------------------------------------");
    return { success: true, mock: true };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "DKFFJ Portal <noreply@dkffj.org>";
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Email failed to send:", error.message);
    return { success: false, error: error.message };
  }
}
