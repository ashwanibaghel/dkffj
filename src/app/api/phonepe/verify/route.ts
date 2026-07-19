import { NextRequest, NextResponse } from "next/server";
import { verifyPhonePeOrder } from "@/lib/payment/phonepe";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { sendTransactionalEmail } from "@/services/email/service";
import {
  getMembershipReceiptTemplate,
  getCourseRegistrationReceiptTemplate,
} from "@/services/email/templates";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch payment record
    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount, status, gateway_transaction_id, created_at, membership_id, registration_id, donation_id, appreciation_id")
      .eq("transaction_id", orderId)
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment record not found" }, { status: 404 });
    }

    // Determine details
    let customerEmail = "";
    let customerName = "";
    let fatherName = "";
    let customerMobile = "";
    let ackOrEnrollmentNo = "";
    let courseTitle = "";
    let paymentType = "donation";
    let isBypass = false;

    const isBypassCheck = (email: string) => {
      const e = email.toLowerCase().trim();
      return e.includes("bypass") || e === "ashwanibaghel826@gmail.com";
    };

    if (payment.membership_id) {
      paymentType = "membership";
      const { data: membership } = await supabase
        .from("memberships")
        .select("email, full_name, father_name, ack_no, mobile")
        .eq("id", payment.membership_id)
        .maybeSingle();
      if (membership) {
        customerEmail = membership.email;
        customerName = membership.full_name;
        fatherName = membership.father_name;
        ackOrEnrollmentNo = membership.ack_no;
        customerMobile = membership.mobile;
        if (isBypassCheck(membership.email)) {
          isBypass = true;
        }
      }
    } else if (payment.registration_id) {
      paymentType = "enrollment";
      const { data: registration } = await supabase
        .from("course_registrations")
        .select(`email, full_name, father_name, enrollment_no, mobile, courses (title)`)
        .eq("id", payment.registration_id)
        .maybeSingle();
      if (registration) {
        customerEmail = registration.email;
        customerName = registration.full_name;
        fatherName = registration.father_name || "";
        ackOrEnrollmentNo = registration.enrollment_no || "PENDING";
        customerMobile = registration.mobile;
        courseTitle = (registration.courses as any)?.title || "Selected Course";
        if (isBypassCheck(registration.email)) {
          isBypass = true;
        }
      }
    } else if (payment.donation_id) {
      paymentType = "donation";
      const prismaLocal = (await import("@/lib/prisma")).default;
      const donation = await prismaLocal.donations.findUnique({
        where: { id: payment.donation_id }
      });
      if (donation) {
        customerEmail = donation.donor_email;
        customerName = donation.donor_name;
        fatherName = "N/A";
        customerMobile = donation.donor_mobile || "";
        ackOrEnrollmentNo = donation.transaction_id || orderId;
        if (isBypassCheck(donation.donor_email)) {
          isBypass = true;
        }
      }
    } else if (payment.appreciation_id) {
      paymentType = "appreciation";
      const { data: app } = await supabase
        .from("appreciation_applications")
        .select("email, full_name, application_no, mobile")
        .eq("id", payment.appreciation_id)
        .maybeSingle();
      if (app) {
        customerEmail = app.email;
        customerName = app.full_name;
        fatherName = "N/A"; // Appreciation does not collect father's name
        ackOrEnrollmentNo = app.application_no;
        customerMobile = app.mobile;
        if (isBypassCheck(app.email)) {
          isBypass = true;
        }
      }
    }

    const payloadDetails = {
      customerName,
      fatherName,
      customerMobile,
      customerEmail,
      amount: Number(payment.amount),
      date: payment.created_at,
      gatewayTransactionId: payment.gateway_transaction_id || "PENDING",
      ackOrEnrollmentNo,
      paymentType,
      description: courseTitle || (paymentType === "membership" ? "NGO Membership Fee" : paymentType === "appreciation" ? "Appreciation Application Fee" : "General Donation")
    };

    if (payment.status === "COMPLETED") {
      // Payment is done — but check if the linked entity was also updated.
      // If not (partial failure scenario), recover it now.
      if (payment.registration_id) {
        const { data: reg } = await supabase
          .from("course_registrations")
          .select("id, status, enrollment_no, full_name, email, father_name, mobile, courses(title)")
          .eq("id", payment.registration_id)
          .maybeSingle();
        if (reg && reg.status === "PENDING") {
          // Recover: update registration to APPROVED
          await supabase
            .from("course_registrations")
            .update({ status: "APPROVED" })
            .eq("id", reg.id);
          await supabase.from("status_logs").insert({
            registration_id: reg.id,
            from_status: "PENDING",
            to_status: "APPROVED",
            remarks: "Course fee payment already completed. Enrollment auto-recovered and approved.",
          });
          // Send enrollment confirmation email
          try {
            const regCourseTitle = (reg.courses as any)?.title || "Selected Course";
            const emailHtml = getCourseRegistrationReceiptTemplate(
              reg.full_name, regCourseTitle,
              reg.enrollment_no || "PENDING", Number(payment.amount)
            );
            let attachments: any[] = [];
            try {
              const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
              const pdfBuf = await generateReceiptPdfBuffer({
                refId: orderId, date: payment.created_at,
                ackOrEnrollmentNo: reg.enrollment_no || "PENDING",
                gatewayTransactionId: payment.gateway_transaction_id || "PENDING",
                amount: Number(payment.amount), description: regCourseTitle,
                customerName: reg.full_name, fatherName: reg.father_name || "N/A",
                customerMobile: reg.mobile, customerEmail: reg.email
              });
              attachments.push({ filename: `Receipt_${orderId}.pdf`, content: pdfBuf });
            } catch (_) { /* PDF optional */ }
            await sendTransactionalEmail(reg.email, "Course Enrollment Approved - DKFFJ Academy", emailHtml, attachments);
          } catch (emailErr) {
            console.error("[VERIFY RECOVERY] Email send failed:", emailErr);
          }
        }
      } else if (payment.membership_id) {
        const { data: mem } = await supabase
          .from("memberships")
          .select("id, status")
          .eq("id", payment.membership_id)
          .maybeSingle();
        if (mem && mem.status === "PENDING") {
          await supabase.from("memberships").update({ status: "UNDER_REVIEW" }).eq("id", mem.id);
          await supabase.from("status_logs").insert({
            membership_id: mem.id,
            from_status: "PENDING", to_status: "UNDER_REVIEW",
            remarks: "Membership fee payment already completed. Application auto-recovered and forwarded to review.",
          });
        }
      } else if (payment.appreciation_id) {
        const { data: app } = await supabase
          .from("appreciation_applications")
          .select("id, status")
          .eq("id", payment.appreciation_id)
          .maybeSingle();
        if (app && app.status === "PENDING") {
          await supabase.from("appreciation_applications").update({ status: "UNDER_REVIEW" }).eq("id", app.id);
          await supabase.from("status_logs").insert({
            appreciation_id: app.id,
            from_status: "PENDING", to_status: "UNDER_REVIEW",
            remarks: "Appreciation fee payment already completed. Application auto-recovered.",
          });
        }
      }
      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        orderId,
        details: payloadDetails
      });
    }

    if (isBypass) {
      console.log(`[PAYMENT BYPASS] Bypassing payment for orderId: ${orderId}, Email: ${customerEmail}`);
      const mockTxnId = "BYPASS-" + orderId;

      // 1. Mark payment as COMPLETED (optimistic concurrency lock)
      const { data: updatedPayment } = await supabase
        .from("payments")
        .update({
          status: "COMPLETED",
          gateway_transaction_id: mockTxnId,
        })
        .eq("id", payment.id)
        .eq("status", "PENDING")
        .select("id");

      if (!updatedPayment || updatedPayment.length === 0) {
        console.log("[PAYMENT BYPASS] Payment already completed by another thread/process:", orderId);
        return NextResponse.json({
          success: true,
          status: "COMPLETED",
          orderId,
          details: { ...payloadDetails, gatewayTransactionId: mockTxnId }
        });
      }

      // 2. Handle linked entities
      if (payment.membership_id) {
        await supabase
          .from("memberships")
          .update({ status: "UNDER_REVIEW" })
          .eq("id", payment.membership_id);

        await supabase.from("status_logs").insert({
          membership_id: payment.membership_id,
          from_status: "PENDING",
          to_status: "UNDER_REVIEW",
          remarks: "Fee payment bypassed for testing. Application forwarded to review board.",
        });

        const emailHtml = getMembershipReceiptTemplate(
          customerName,
          ackOrEnrollmentNo,
          Number(payment.amount)
        );

        let attachments: any[] = [];
        try {
          const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
          const pdfBuffer = await generateReceiptPdfBuffer({
            refId: orderId,
            date: payment.created_at,
            ackOrEnrollmentNo,
            gatewayTransactionId: mockTxnId,
            amount: Number(payment.amount),
            description: "NGO Membership Fee",
            customerName,
            fatherName,
            customerMobile,
            customerEmail
          });
          attachments.push({ filename: `Receipt_${orderId}.pdf`, content: pdfBuffer });
        } catch (pdfErr) {
          console.error("Failed to generate PDF receipt attachment for membership bypass:", pdfErr);
        }

        await sendTransactionalEmail(
          customerEmail,
          "Payment Verified & Membership Submitted (Bypass Mode) - DKFFJ",
          emailHtml,
          attachments
        );

        // Notify Admins (Bypass Mode)
        try {
          const { data: admins } = await supabase
            .from("users")
            .select("email")
            .in("role", ["ADMIN", "SUPERADMIN"]);
          const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
          const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
          const adminSubject = `[TEST MODE] New Membership Application Verified - ${customerName}`;
          const adminHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
              <div style="padding: 24px; color: #334155;">
                <h2>New Membership Application Verified via Bypass</h2>
                <p>Hello Admin,</p>
                <p>A new membership application fee of <strong>INR ${payment.amount}</strong> has been verified via bypass for candidate: <strong>${customerName}</strong>.</p>
                <p><strong>Acknowledgement Number:</strong> ${ackOrEnrollmentNo}</p>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/admin/members" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
                </div>
              </div>
            </div>
          `;
          for (const adminEmail of adminRecipients) {
            await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
          }
        } catch (adminErr) {
          console.error("Admin notification error (membership bypass):", adminErr);
        }
      } else if (payment.donation_id) {
        const prismaLocal = (await import("@/lib/prisma")).default;
        await prismaLocal.donations.update({
          where: { id: payment.donation_id },
          data: {
            status: "COMPLETED",
            transaction_id: mockTxnId,
          },
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.vercel.app";
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1565C0; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">DK Foundation of Freedom & Justice</h1>
            </div>
            <div style="padding: 24px; color: #334155;">
              <h2>Thank You for Your Generous Support! (Bypass Mode)</h2>
              <p>Dear <strong>${customerName}</strong>,</p>
              <p>We have successfully received your donation of <strong>₹${payment.amount}</strong>.</p>
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <span style="font-size: 12px; color: #166534; font-weight: bold; display: block;">Mock Transaction ID:</span>
                <strong style="font-size: 14px; color: #15803d; display: block; margin-top: 5px; font-family: monospace;">${mockTxnId}</strong>
              </div>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${appUrl}/track?type=donation&id=${orderId}" style="background-color: #1565C0; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Track Donation & Download Certificate</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} DK Foundation. All Rights Reserved.
            </div>
          </div>
        `;

        await sendTransactionalEmail(
          customerEmail,
          "Donation Successfully Received (Bypass Mode) - Thank You! - DKFFJ",
          emailHtml
        );
      } else if (payment.registration_id) {
        await supabase
          .from("course_registrations")
          .update({ status: "APPROVED" })
          .eq("id", payment.registration_id);

        await supabase.from("status_logs").insert({
          registration_id: payment.registration_id,
          from_status: "PENDING",
          to_status: "APPROVED",
          remarks: "Course fee payment bypassed for testing. Enrollment approved.",
        });

        const emailHtml = getCourseRegistrationReceiptTemplate(
          customerName,
          courseTitle,
          ackOrEnrollmentNo,
          Number(payment.amount)
        );

        let attachments: any[] = [];
        try {
          const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
          const pdfBuffer = await generateReceiptPdfBuffer({
            refId: orderId,
            date: payment.created_at,
            ackOrEnrollmentNo,
            gatewayTransactionId: mockTxnId,
            amount: Number(payment.amount),
            description: courseTitle || "Selected Course",
            customerName,
            fatherName,
            customerMobile,
            customerEmail
          });
          attachments.push({ filename: `Receipt_${orderId}.pdf`, content: pdfBuffer });
        } catch (pdfErr) {
          console.error("Failed to generate PDF receipt attachment for course bypass:", pdfErr);
        }

        await sendTransactionalEmail(
          customerEmail,
          "Course Enrollment Successful (Bypass Mode) - DKFFJ Academy",
          emailHtml,
          attachments
        );

        // Notify Admins (Bypass Mode)
        try {
          const { data: admins } = await supabase
            .from("users")
            .select("email")
            .in("role", ["ADMIN", "SUPERADMIN"]);
          const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
          const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
          const adminSubject = `[TEST MODE] New Course Enrollment Verified - ${customerName}`;
          const adminHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
              <div style="padding: 24px; color: #334155;">
                <h2>New Student Enrollment Verified via Bypass</h2>
                <p>Hello Admin,</p>
                <p>A new student enrollment fee of <strong>INR ${payment.amount}</strong> has been verified via bypass for: <strong>${customerName}</strong> for the course: <strong>${courseTitle}</strong>.</p>
                <p><strong>Enrollment Number:</strong> ${ackOrEnrollmentNo}</p>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/admin/registrations" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
                </div>
              </div>
            </div>
          `;
          for (const adminEmail of adminRecipients) {
            await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
          }
        } catch (adminErr) {
          console.error("Admin notification error (course bypass):", adminErr);
        }
      } else if (payment.appreciation_id) {
        await supabase
          .from("appreciation_applications")
          .update({ status: "UNDER_REVIEW" })
          .eq("id", payment.appreciation_id);

        await supabase.from("status_logs").insert({
          appreciation_id: payment.appreciation_id,
          from_status: "PENDING",
          to_status: "UNDER_REVIEW",
          remarks: "Appreciation fee payment bypassed for testing. Forwarded to board review.",
        });

        const { getAppreciationReceiptTemplate } = await import("@/services/email/templates");
        const emailHtml = getAppreciationReceiptTemplate(
          customerName,
          ackOrEnrollmentNo,
          Number(payment.amount)
        );

        let attachments: any[] = [];
        try {
          const { generateReceiptPdfBuffer } = await import("@/lib/payment/receiptPdf");
          const pdfBuffer = await generateReceiptPdfBuffer({
            refId: orderId,
            date: payment.created_at,
            ackOrEnrollmentNo,
            gatewayTransactionId: mockTxnId,
            amount: Number(payment.amount),
            description: "Appreciation Application Fee",
            customerName,
            fatherName,
            customerMobile,
            customerEmail
          });
          attachments.push({ filename: `Receipt_${orderId}.pdf`, content: pdfBuffer });
        } catch (pdfErr) {
          console.error("Failed to generate PDF receipt attachment for appreciation bypass:", pdfErr);
        }

        await sendTransactionalEmail(
          customerEmail,
          "Payment Verified & Appreciation Application Submitted (Bypass Mode) - DKFFJ",
          emailHtml,
          attachments
        );

        // Notify Admins (Bypass Mode)
        try {
          const { data: admins } = await supabase
            .from("users")
            .select("email")
            .in("role", ["ADMIN", "SUPERADMIN"]);
          const adminEmails = admins?.map((a) => a.email).filter(Boolean) || [];
          const adminRecipients = Array.from(new Set([...adminEmails, "info@dkffj.org"]));
          const adminSubject = `[TEST MODE] New Appreciation Application Verified - ${customerName}`;
          const adminHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
              <div style="padding: 24px; color: #334155;">
                <h2>New Appreciation Application Verified via Bypass</h2>
                <p>Hello Admin,</p>
                <p>An appreciation application fee of <strong>INR ${payment.amount}</strong> has been verified via bypass for: <strong>${customerName}</strong>.</p>
                <p><strong>Application Number:</strong> ${ackOrEnrollmentNo}</p>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dkffj.vercel.app'}/admin/appreciation" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">Go to Admin Portal</a>
                </div>
              </div>
            </div>
          `;
          for (const adminEmail of adminRecipients) {
            await sendTransactionalEmail(adminEmail, adminSubject, adminHtml);
          }
        } catch (adminErr) {
          console.error("Admin notification error (appreciation bypass):", adminErr);
        }
      }

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        orderId,
        details: { ...payloadDetails, gatewayTransactionId: mockTxnId }
      });
    }

    // Otherwise verify with PhonePe directly
    const result = await verifyPhonePeOrder(orderId);

    // If PhonePe says completed but our DB isn't updated yet, trigger update
    if (result.success && payment && payment.status !== "COMPLETED") {
      const { processPaymentCompletion } = await import("../callback/route");
      await processPaymentCompletion(orderId);
    }

    return NextResponse.json({
      success: result.success,
      status: result.state,
      transactionId: result.transactionId,
      orderId,
      details: { ...payloadDetails, gatewayTransactionId: result.transactionId || "PENDING" }
    });
  } catch (err: any) {
    console.error("PhonePe verify error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
