"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export interface TrackingResult {
  found: boolean;
  type: "membership" | "complaint" | "enrollment";
  number: string;
  name: string;
  status: string;
  date: string;
  details?: string;
  timeline: {
    id: string;
    fromStatus: string;
    toStatus: string;
    remarks: string;
    date: string;
  }[];
}

export async function getTrackingDetails(type: string, trackingNumber: string): Promise<TrackingResult | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = trackingNumber.trim();

  if (!searchStr) return null;

  if (type === "membership") {
    // Search by ACK number or Membership number
    const { data: membership, error } = await supabase
      .from("memberships")
      .select(`
        id, 
        ack_no, 
        membership_no, 
        full_name, 
        status, 
        created_at,
        remarks,
        status_logs (
          id,
          from_status,
          to_status,
          remarks,
          created_at
        )
      `)
      .or(`ack_no.eq.${searchStr},membership_no.eq.${searchStr}`)
      .maybeSingle();

    if (error) {
      console.error("Error fetching membership tracking:", error);
      return { found: false, type: "membership", number: searchStr, name: "", status: "", date: "", timeline: [] };
    }

    if (!membership) return { found: false, type: "membership", number: searchStr, name: "", status: "", date: "", timeline: [] };

    // Format timeline
    const timeline = (membership.status_logs || []).map((log: any) => ({
      id: log.id,
      fromStatus: log.from_status,
      toStatus: log.to_status,
      remarks: log.remarks || "No remarks available.",
      date: new Date(log.created_at).toLocaleString("en-IN"),
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      found: true,
      type: "membership",
      number: membership.membership_no || membership.ack_no,
      name: membership.full_name,
      status: membership.status,
      date: new Date(membership.created_at).toLocaleDateString("en-IN"),
      details: membership.remarks || undefined,
      timeline,
    };
  }

  if (type === "complaint") {
    const { data: complaint, error } = await supabase
      .from("complaints")
      .select(`
        id, 
        complaint_no, 
        name, 
        status, 
        created_at,
        details,
        status_logs (
          id,
          from_status,
          to_status,
          remarks,
          created_at
        )
      `)
      .eq("complaint_no", searchStr)
      .maybeSingle();

    if (error) {
      console.error("Error fetching complaint tracking:", error);
      return { found: false, type: "complaint", number: searchStr, name: "", status: "", date: "", timeline: [] };
    }

    if (!complaint) return { found: false, type: "complaint", number: searchStr, name: "", status: "", date: "", timeline: [] };

    const timeline = (complaint.status_logs || []).map((log: any) => ({
      id: log.id,
      fromStatus: log.from_status,
      toStatus: log.to_status,
      remarks: log.remarks || "No remarks available.",
      date: new Date(log.created_at).toLocaleString("en-IN"),
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      found: true,
      type: "complaint",
      number: complaint.complaint_no,
      name: complaint.name,
      status: complaint.status,
      date: new Date(complaint.created_at).toLocaleDateString("en-IN"),
      details: complaint.details,
      timeline,
    };
  }

  if (type === "enrollment") {
    const { data: enrollment, error } = await supabase
      .from("course_registrations")
      .select(`
        id, 
        enrollment_no, 
        full_name, 
        status, 
        created_at,
        remarks,
        courses (
          title
        ),
        status_logs (
          id,
          from_status,
          to_status,
          remarks,
          created_at
        )
      `)
      .eq("enrollment_no", searchStr)
      .maybeSingle();

    if (error) {
      console.error("Error fetching enrollment tracking:", error);
      return { found: false, type: "enrollment", number: searchStr, name: "", status: "", date: "", timeline: [] };
    }

    if (!enrollment) return { found: false, type: "enrollment", number: searchStr, name: "", status: "", date: "", timeline: [] };

    const timeline = (enrollment.status_logs || []).map((log: any) => ({
      id: log.id,
      fromStatus: log.from_status,
      toStatus: log.to_status,
      remarks: log.remarks || "No remarks available.",
      date: new Date(log.created_at).toLocaleString("en-IN"),
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      found: true,
      type: "enrollment",
      number: enrollment.enrollment_no,
      name: `${enrollment.full_name} (${enrollment.courses?.title || "Unknown Course"})`,
      status: enrollment.status,
      date: new Date(enrollment.created_at).toLocaleDateString("en-IN"),
      details: enrollment.remarks || undefined,
      timeline,
    };
  }

  return null;
}
