import { Resend } from "resend";

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Array<{ filename: string; content: Buffer }>
) {
  // Read key fresh every call — do NOT cache at module level
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || resendApiKey === "re_placeholder") {
    console.log("[MOCK EMAIL] RESEND_API_KEY not set, logging email only.");
    console.log(`To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }

  const resend = new Resend(resendApiKey);

  try {
    // Use RESEND_FROM_EMAIL if set and valid, else fallback to verified domain
    const fromEmailEnv = process.env.RESEND_FROM_EMAIL || "";
    const fromEmail = (fromEmailEnv && fromEmailEnv.includes("@"))
      ? fromEmailEnv
      : "DKFFJ <no-reply@dkffj.org>";

    console.log(`[EMAIL] Sending to: ${to} | From: ${fromEmail} | Subject: ${subject} | KeyPrefix: ${resendApiKey.substring(0, 8)}...`);

    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
      attachments: attachments || undefined,
    });

    if (response.error) {
      console.error("[EMAIL ERROR] Resend API error:", JSON.stringify(response.error));
      return { success: false, error: response.error.message || "Failed to deliver email." };
    }

    console.log(`[EMAIL] Sent successfully, id: ${response.data?.id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[EMAIL EXCEPTION]", error.message);
    return { success: false, error: error.message };
  }
}
