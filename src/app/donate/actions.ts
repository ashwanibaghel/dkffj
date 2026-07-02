"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { paymentServiceInstance } from "@/lib/payment/service";

const prisma = new PrismaClient();

export interface DonationSubmissionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function submitDonation(formData: FormData): Promise<DonationSubmissionResult> {
  const donorName = formData.get("donorName") as string;
  const donorEmail = formData.get("donorEmail") as string;
  const donorMobile = formData.get("donorMobile") as string;
  const donorAddress = formData.get("donorAddress") as string;
  const amountStr = formData.get("amount") as string;
  const purpose = formData.get("purpose") as string;

  if (!donorName || !donorEmail || !donorMobile || !donorAddress || !amountStr || !purpose) {
    return { success: false, error: "All fields are required." };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Please enter a valid donation amount." };
  }

  try {
    // Generate Order ID like DKD-2026-10254
    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const orderId = `DKD-${currentYear}-${randomSeq}`;

    // Create donation record
    const donation = await prisma.donations.create({
      data: {
        order_id: orderId,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_mobile: donorMobile,
        donor_address: donorAddress,
        amount: amount,
        purpose: purpose,
        status: "PENDING",
      },
    });

    // Create payment record linked to this donation
    await prisma.payments.create({
      data: {
        amount: amount,
        transaction_id: orderId,
        gateway: "PHONEPE",
        status: "PENDING",
        donation_id: donation.id,
      },
    });

    const checkoutUrl = await paymentServiceInstance.processPayment({
      orderId,
      amount,
      currency: "INR",
      customerEmail: donorEmail,
      customerMobile: donorMobile,
    });

    return {
      success: true,
      redirectUrl: checkoutUrl,
    };
  } catch (err: any) {
    console.error("Donation creation error:", err);
    return {
      success: false,
      error: "Failed to process donation registration. Please try again.",
    };
  }
}
