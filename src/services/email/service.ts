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
    const fromEmail = process.env.RESEND_FROM_EMAIL || "DKFFJ <no-reply@mail.dkffj.org>";
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
      attachments: attachments || undefined,
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Email failed to send:", error.message);
    return { success: false, error: error.message };
  }
}
