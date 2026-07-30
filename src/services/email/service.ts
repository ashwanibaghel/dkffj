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
    const fromEmailEnv = process.env.RESEND_FROM_EMAIL || "";
    const primaryFrom = (fromEmailEnv && fromEmailEnv.includes("@"))
      ? fromEmailEnv
      : "DKFFJ <info@dkffj.org>";

    console.log(`[EMAIL] Attempting delivery to: ${to} | From: ${primaryFrom}`);

    // Attempt 1: Try custom domain
    let response = await resend.emails.send({
      from: primaryFrom,
      to,
      subject,
      html: htmlContent,
      attachments: attachments || undefined,
    });

    if (response.error) {
      console.warn("[EMAIL WARN] Primary sender failed:", response.error.message);
      // Attempt 2: Fallback to Resend default verified sender (onboarding@resend.dev)
      console.log(`[EMAIL] Retrying delivery to: ${to} via fallback sender onboarding@resend.dev`);
      response = await resend.emails.send({
        from: "DKFFJ <onboarding@resend.dev>",
        to,
        subject,
        html: htmlContent,
        attachments: attachments || undefined,
      });
    }

    if (response.error) {
      console.error("[EMAIL ERROR] Resend API error:", JSON.stringify(response.error));
      return { success: false, error: response.error.message || "Failed to deliver email." };
    }

    console.log(`[EMAIL] Delivered successfully, id: ${response.data?.id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("[EMAIL EXCEPTION]", error.message);
    return { success: false, error: error.message };
  }
}
