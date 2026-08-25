import { sendTransactionalEmail } from "@/services/email/service";
import { getAffiliationReceiptTemplate } from "@/services/email/templates";
import { generateReceiptPdfBuffer } from "@/lib/payment/receiptPdf";
import { AFFILIATION_FEE_AMOUNT, AFFILIATION_FEE_DESCRIPTION, AFFILIATION_FEE_NOTE, AFFILIATION_RECEIPT_PREFIX } from "@/lib/affiliation-config";

type PaymentRecord = {
  id: string;
  affiliation_id?: string | null;
  amount: number | string | null;
  transaction_id: string;
  status?: string | null;
  created_at?: string | null;
};

/**
 * Idempotently promotes a paid affiliation draft to SUBMITTED. It is safe to
 * call from both the PhonePe webhook and the browser verification endpoint.
 */
export async function finalizeAffiliationPayment(params: {
  supabase: any;
  payment: PaymentRecord;
  gatewayTransactionId: string;
  paidAmount?: number;
}) {
  const { supabase, payment, gatewayTransactionId } = params;
  const affiliationId = payment.affiliation_id;
  if (!affiliationId) throw new Error("Affiliation payment is missing its application reference.");

  const paidAmount = Number(params.paidAmount ?? payment.amount ?? 0);
  if (paidAmount !== AFFILIATION_FEE_AMOUNT) {
    await supabase.from("payments").update({
      status: "FAILED",
      failure_reason: `Amount mismatch: expected ${AFFILIATION_FEE_AMOUNT}, got ${paidAmount}`
    }).eq("id", payment.id);
    throw new Error("Payment amount could not be verified.");
  }

  const { data: affiliation, error: affiliationError } = await supabase
    .from("affiliations")
    .select("id, application_no, current_status, organization_name, affiliation_applicants(full_name, email, mobile)")
    .eq("id", affiliationId)
    .maybeSingle();
  if (affiliationError || !affiliation) throw new Error("Affiliation application was not found.");

  const applicant = (affiliation.affiliation_applicants as any)?.[0] || {};
  if (!applicant.full_name || !applicant.email || !applicant.mobile) {
    throw new Error("Affiliation applicant contact details are incomplete.");
  }

  let applicationNo = affiliation.application_no;
  if (!applicationNo || applicationNo.startsWith("AFF-DRAFT-")) {
    const currentYear = new Date().getFullYear();
    const { data: generatedNo, error: sequenceError } = await supabase.rpc("generate_next_number", {
      p_key: "affiliation_app",
      p_prefix: `AFF-${currentYear}-`
    });
    if (sequenceError || !generatedNo) {
      throw new Error("Could not assign the official application number.");
    }
    applicationNo = generatedNo;
  }

  const receiptNo = `${AFFILIATION_RECEIPT_PREFIX}${new Date().getFullYear()}/${applicationNo.split("-").pop() || "000001"}`;
  const paidAt = new Date().toISOString();
  const { data: transitioned, error: transitionError } = await supabase
    .from("affiliations")
    .update({
      application_no: applicationNo,
      current_status: "SUBMITTED",
      public_remarks: "Payment verified. Application submitted for board review."
    })
    .eq("id", affiliationId)
    .eq("current_status", "DRAFT")
    .select("id");
  if (transitionError) throw transitionError;

  const didTransition = Boolean(transitioned?.length);
  const { error: paymentUpdateError } = await supabase.from("payments").update({
    status: "COMPLETED",
    gateway_transaction_id: gatewayTransactionId,
    receipt_no: receiptNo,
    paid_at: paidAt
  }).eq("id", payment.id);
  if (paymentUpdateError) throw paymentUpdateError;

  if (!didTransition) {
    return { applicationNo: affiliation.application_no || applicationNo, receiptNo, alreadyProcessed: true };
  }

  await supabase.from("status_logs").insert({
    affiliation_id: affiliationId,
    from_status: "DRAFT",
    to_status: "SUBMITTED",
    remarks: `Affiliation fee of ₹${paidAmount} verified. Official application number assigned: ${applicationNo}`
  });

  // Notification failures never roll back a confirmed payment. They are logged
  // for follow-up while the applicant can still track and download the receipt.
  try {
    const emailHtml = getAffiliationReceiptTemplate(
      applicant.full_name,
      affiliation.organization_name,
      affiliation.application_no,
      applicationNo,
      paidAmount,
      gatewayTransactionId,
      receiptNo,
      paidAt
    );
    let attachments: Array<{ filename: string; content: Buffer }> = [];
    try {
      const pdfBuffer = await generateReceiptPdfBuffer({
        refId: applicationNo,
        receiptNo,
        date: paidAt,
        ackOrEnrollmentNo: applicationNo,
        gatewayTransactionId,
        amount: paidAmount,
        description: AFFILIATION_FEE_DESCRIPTION,
        customerName: applicant.full_name,
        customerMobile: applicant.mobile,
        customerEmail: applicant.email,
        instituteName: affiliation.organization_name,
        receiptType: "AFFILIATION",
        refundPolicyNote: AFFILIATION_FEE_NOTE
      });
      attachments = [{ filename: `Receipt_${applicationNo}.pdf`, content: pdfBuffer }];
    } catch (error) {
      console.error("Affiliation receipt PDF generation failed:", error);
    }
    await sendTransactionalEmail(applicant.email, `Affiliation Application Payment Received - ${applicationNo}`, emailHtml, attachments);
  } catch (error) {
    console.error("Affiliation payment receipt email failed:", error);
  }

  try {
    const { data: admins } = await supabase.from("users").select("email").in("role", ["ADMIN", "SUPERADMIN"]);
    const recipients = Array.from(new Set([...(admins?.map((admin: any) => admin.email).filter(Boolean) || []), "info@dkffj.org"]));
    const subject = `New Institute Affiliation Application Paid — ${affiliation.organization_name}`;
    const message = `<p>A ₹${paidAmount} affiliation payment has been verified.</p><p><strong>Institute:</strong> ${affiliation.organization_name}<br/><strong>Application No:</strong> ${applicationNo}<br/><strong>Applicant:</strong> ${applicant.full_name}</p>`;
    await Promise.all(recipients.map((recipient) => sendTransactionalEmail(recipient, subject, message)));
  } catch (error) {
    console.error("Affiliation admin notification failed:", error);
  }

  return { applicationNo, receiptNo, alreadyProcessed: false };
}
