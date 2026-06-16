"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export interface AdminNotification {
  id: string;
  type: "registration" | "membership" | "payment";
  title: string;
  description: string;
  created_at: string;
  link: string;
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch pending course registrations
  const { data: pendingRegs, error: regsError } = await supabase
    .from("course_registrations")
    .select(`
      id,
      full_name,
      created_at,
      courses (
        title
      )
    `)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(10);

  if (regsError) {
    console.error("Error fetching pending registrations for notifications:", regsError);
  }

  // 2. Fetch pending memberships
  const { data: pendingMembers, error: membersError } = await supabase
    .from("memberships")
    .select(`
      id,
      full_name,
      created_at
    `)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false })
    .limit(10);

  if (membersError) {
    console.error("Error fetching pending memberships for notifications:", membersError);
  }

  // 3. Fetch recent payments
  const { data: recentPayments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      created_at,
      memberships (
        full_name
      ),
      course_registrations (
        full_name,
        courses (
          title
        )
      )
    `)
    .eq("status", "COMPLETED")
    .order("created_at", { ascending: false })
    .limit(10);

  if (paymentsError) {
    console.error("Error fetching recent payments for notifications:", paymentsError);
  }

  const notifications: AdminNotification[] = [];

  // Map registrations
  if (pendingRegs) {
    pendingRegs.forEach((reg: any) => {
      notifications.push({
        id: reg.id,
        type: "registration",
        title: "New Course Application",
        description: `${reg.full_name} applied for ${reg.courses?.title || "a course"}`,
        created_at: reg.created_at,
        link: "/admin/registrations"
      });
    });
  }

  // Map memberships
  if (pendingMembers) {
    pendingMembers.forEach((member: any) => {
      notifications.push({
        id: member.id,
        type: "membership",
        title: "New Membership Application",
        description: `${member.full_name} applied for membership`,
        created_at: member.created_at,
        link: "/admin/members"
      });
    });
  }

  // Map payments
  if (recentPayments) {
    recentPayments.forEach((payment: any) => {
      let payerName = "Unknown Student";
      let paymentDetails = "";

      if (payment.memberships) {
        payerName = payment.memberships.full_name;
        paymentDetails = "for membership registration";
      } else if (payment.course_registrations) {
        payerName = payment.course_registrations.full_name;
        paymentDetails = `for ${payment.course_registrations.courses?.title || "course"}`;
      }

      notifications.push({
        id: payment.id,
        type: "payment",
        title: "Payment Received",
        description: `Received INR ${payment.amount} from ${payerName} ${paymentDetails}`,
        created_at: payment.created_at,
        link: "/admin/payments"
      });
    });
  }

  // Sort all notifications by created_at descending
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return notifications;
}
