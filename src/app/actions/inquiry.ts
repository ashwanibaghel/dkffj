"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "danishkhan.dkffj@gmail.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@dkffj.org";

export interface InquiryFormData {
  name: string;
  mobile: string;
  email?: string;
  subject: string;
  inquiryType: string;
  message: string;
}

export async function submitInquiry(data: InquiryFormData): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Save inquiry to database
    const inquiry = await prisma.inquiry.create({
      data: {
        name:        data.name.trim(),
        mobile:      data.mobile.trim(),
        email:       data.email?.trim() || null,
        subject:     data.subject.trim(),
        inquiryType: data.inquiryType,
        message:     data.message.trim(),
        status:      "New",
      },
    });

    // 2. Send notification email to ADMIN
    await resend.emails.send({
      from: FROM_EMAIL,
      to:   ADMIN_EMAIL,
      subject: `[New Inquiry] ${data.subject} — ${data.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1565C0,#0D47A1);padding:24px 28px;">
            <h2 style="margin:0;color:#fff;font-size:18px;">📩 New Inquiry Received</h2>
            <p style="margin:4px 0 0;color:#bbdefb;font-size:12px;">DK Foundation of Freedom & Justice — Contact Form</p>
          </div>
          <div style="padding:24px 28px;background:#f9fafb;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr><td style="padding:8px 0;color:#555;width:130px;font-weight:600;">Name:</td><td style="color:#111;">${data.name}</td></tr>
              <tr><td style="padding:8px 0;color:#555;font-weight:600;">Mobile:</td><td style="color:#111;">${data.mobile}</td></tr>
              <tr><td style="padding:8px 0;color:#555;font-weight:600;">Email:</td><td style="color:#111;">${data.email || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#555;font-weight:600;">Type:</td><td style="color:#111;">${data.inquiryType}</td></tr>
              <tr><td style="padding:8px 0;color:#555;font-weight:600;">Subject:</td><td style="color:#111;font-weight:700;">${data.subject}</td></tr>
            </table>
            <div style="margin-top:16px;background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:14px 16px;">
              <p style="margin:0;color:#555;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Message</p>
              <p style="margin:8px 0 0;color:#222;font-size:13px;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
            </div>
            <p style="margin:20px 0 0;font-size:11px;color:#999;">Inquiry ID: ${inquiry.id} &nbsp;|&nbsp; Submitted: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          </div>
          <div style="padding:14px 28px;background:#1565C0;text-align:center;">
            <a href="https://dkffj.vercel.app/admin" style="color:#fff;font-size:12px;text-decoration:none;font-weight:600;">View in Admin Dashboard →</a>
          </div>
        </div>
      `,
    });

    // 3. Send acknowledgement email to USER (if email provided)
    if (data.email && data.email.trim()) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to:   data.email.trim(),
        subject: `We received your inquiry — DKFFJ`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1565C0,#0D47A1);padding:24px 28px;">
              <h2 style="margin:0;color:#fff;font-size:18px;">✅ Inquiry Received</h2>
              <p style="margin:4px 0 0;color:#bbdefb;font-size:12px;">DK Foundation of Freedom & Justice</p>
            </div>
            <div style="padding:24px 28px;background:#f9fafb;">
              <p style="font-size:14px;color:#222;">Dear <strong>${data.name}</strong>,</p>
              <p style="font-size:13px;color:#444;line-height:1.7;">
                Thank you for reaching out to the <strong>DK Foundation of Freedom & Justice</strong>. 
                We have received your inquiry regarding "<strong>${data.subject}</strong>" and our team will get back to you shortly.
              </p>
              <div style="margin:20px 0;background:#fff;border-left:4px solid #1565C0;padding:14px 16px;border-radius:4px;">
                <p style="margin:0;font-size:12px;color:#666;font-weight:600;">YOUR MESSAGE</p>
                <p style="margin:8px 0 0;font-size:13px;color:#333;white-space:pre-wrap;">${data.message}</p>
              </div>
              <p style="font-size:12px;color:#777;margin-top:16px;">
                📞 You can also reach us on WhatsApp: <strong>+91 98712 19033</strong><br/>
                📧 For urgent matters: <strong>dkffj.org@gmail.com</strong>
              </p>
              <p style="font-size:11px;color:#aaa;margin-top:20px;">Reference ID: ${inquiry.id}</p>
            </div>
            <div style="padding:14px 28px;background:#1565C0;text-align:center;">
              <p style="margin:0;color:#bbdefb;font-size:11px;">DK Foundation of Freedom & Justice &nbsp;|&nbsp; Kanpur, Uttar Pradesh</p>
            </div>
          </div>
        `,
      });
    }

    revalidatePath("/admin");
    return { success: true, message: "Your inquiry has been submitted successfully. We will contact you shortly!" };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return { success: false, message: "Something went wrong. Please try again or call us directly." };
  }
}

// For admin dashboard — fetch all inquiries
export async function getAllInquiries() {
  try {
    return await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return [];
  }
}

// Mark inquiry as read/resolved
export async function updateInquiryStatus(id: string, status: string) {
  try {
    await prisma.inquiry.update({
      where: { id },
      data:  { status },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
