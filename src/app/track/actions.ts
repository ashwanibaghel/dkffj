"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface TrackingResult {
  found: boolean;
  type: "membership" | "complaint" | "enrollment" | "donation" | "appreciation";
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
  certificate?: {
    certificate_no: string;
    pdf_url: string;
  } | null;
  memberDetails?: {
    father_name: string;
    gender: string;
    dob: string;
    mobile: string;
    whatsapp: string;
    email: string;
    address: string;
    district: string;
    state: string;
    pincode: string;
    education: string;
    profession: string;
    working_area: string;
    designation: string;
    photo_url: string;
    approved_at?: string | null;
    created_at?: string;
    ack_no?: string;
  } | null;
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
        father_name,
        gender,
        dob,
        mobile,
        whatsapp,
        email,
        address,
        district,
        state,
        pincode,
        education,
        profession,
        working_area,
        designation,
        photo_url,
        status, 
        created_at,
        approved_at,
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
      memberDetails: {
        father_name: membership.father_name,
        gender: membership.gender,
        dob: new Date(membership.dob).toLocaleDateString("en-IN"),
        mobile: membership.mobile,
        whatsapp: membership.whatsapp,
        email: membership.email,
        address: membership.address,
        district: membership.district,
        state: membership.state,
        pincode: membership.pincode,
        education: membership.education,
        profession: membership.profession,
        working_area: membership.working_area,
        designation: membership.designation,
        photo_url: membership.photo_url,
        approved_at: membership.approved_at,
        created_at: membership.created_at,
        ack_no: membership.ack_no,
      }
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
    let enrollment = null;

    // 1. Try searching by enrollment_no
    const { data: byEnrollment, error: errEnrollment } = await supabase
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

    if (byEnrollment) {
      enrollment = byEnrollment;
    } else {
      // 2. Try searching by certificate_no in certificates table
      const { data: certRecord, error: errCert } = await supabase
        .from("certificates")
        .select("registration_id")
        .eq("certificate_no", searchStr)
        .eq("status", "VALID")
        .maybeSingle();

      if (certRecord && certRecord.registration_id) {
        const { data: byId, error: errById } = await supabase
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
          .eq("id", certRecord.registration_id)
          .maybeSingle();

        if (byId) {
          enrollment = byId;
        }
      }
    }

    if (!enrollment) {
      return { found: false, type: "enrollment", number: searchStr, name: "", status: "", date: "", timeline: [] };
    }

    // 3. Fetch the certificate details if status is COMPLETED
    let certificate = null;
    if (enrollment.status === "COMPLETED") {
      const { data: certData } = await supabase
        .from("certificates")
        .select("certificate_no, pdf_url")
        .eq("registration_id", enrollment.id)
        .eq("status", "VALID")
        .maybeSingle();

      if (certData) {
        certificate = {
          certificate_no: certData.certificate_no,
          pdf_url: certData.pdf_url,
        };
      }
    }

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
      name: `${enrollment.full_name} (${(enrollment.courses as any)?.title || (Array.isArray(enrollment.courses) && (enrollment.courses[0] as any)?.title) || "Unknown Course"})`,
      status: enrollment.status,
      date: new Date(enrollment.created_at).toLocaleDateString("en-IN"),
      details: enrollment.remarks || undefined,
      timeline,
      certificate,
    };
  }

  if (type === "donation") {
    let donation = null;
    try {
      donation = await prisma.donations.findUnique({
        where: { order_id: searchStr }
      });
    } catch (error) {
      console.error("Error fetching donation tracking via Prisma:", error);
      return { found: false, type: "donation", number: searchStr, name: "", status: "", date: "", timeline: [] };
    }

    if (!donation) return { found: false, type: "donation", number: searchStr, name: "", status: "", date: "", timeline: [] };

    const timeline = [
      {
        id: donation.id,
        fromStatus: "INITIATED",
        toStatus: donation.status,
        remarks: donation.status === "COMPLETED" 
          ? "Donation payment verified successfully. Certificate generated." 
          : "Donation initiated. Awaiting payment gateway response.",
        date: new Date(donation.created_at).toLocaleString("en-IN")
      }
    ];

    return {
      found: true,
      type: "donation",
      number: donation.order_id,
      name: donation.donor_name,
      status: donation.status,
      date: new Date(donation.created_at).toLocaleDateString("en-IN"),
      details: `Purpose: ${donation.purpose} | Amount: ₹${donation.amount}`,
      timeline,
      memberDetails: {
        father_name: "N/A",
        gender: "N/A",
        dob: "N/A",
        mobile: donation.donor_mobile,
        whatsapp: "N/A",
        email: donation.donor_email,
        address: donation.donor_address,
        district: "N/A",
        state: "N/A",
        pincode: "N/A",
        education: "N/A",
        profession: "N/A",
        working_area: donation.purpose,
        designation: "Donor",
        photo_url: "",
        approved_at: donation.created_at,
        created_at: donation.created_at,
        ack_no: donation.order_id,
      }
    };
    return {
      success: true,
      type: "donation",
      refId: donation.order_id,
      message: "Donation payment verified successfully."
    };
  }

  return null;
}

export async function getSecureMembershipDetails(ackNo: string, contact: string): Promise<TrackingResult | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = ackNo.trim();
  const contactStr = contact.trim();

  if (!searchStr || !contactStr) return null;

  const { data: membership, error } = await supabase
    .from("memberships")
    .select(`
      id, 
      ack_no, 
      membership_no, 
      full_name, 
      father_name,
      gender,
      dob,
      mobile,
      whatsapp,
      email,
      address,
      district,
      state,
      pincode,
      education,
      profession,
      working_area,
      designation,
      photo_url,
      status, 
      created_at,
      approved_at,
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

  if (error || !membership) {
    return { found: false, type: "membership", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

  // Security check: Must match registered mobile or email
  const matchMobile = membership.mobile && membership.mobile.trim() === contactStr;
  const matchEmail = membership.email && membership.email.toLowerCase().trim() === contactStr.toLowerCase();

  if (!matchMobile && !matchEmail) {
    return { found: false, type: "membership", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

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
    memberDetails: {
      father_name: membership.father_name,
      gender: membership.gender,
      dob: new Date(membership.dob).toLocaleDateString("en-IN"),
      mobile: membership.mobile,
      whatsapp: membership.whatsapp,
      email: membership.email,
      address: membership.address,
      district: membership.district,
      state: membership.state,
      pincode: membership.pincode,
      education: membership.education,
      profession: membership.profession,
      working_area: membership.working_area,
      designation: membership.designation,
      photo_url: membership.photo_url,
      approved_at: membership.approved_at ? new Date(membership.approved_at).toISOString() : null,
      created_at: new Date(membership.created_at).toISOString(),
      ack_no: membership.ack_no,
    }
  };
}

export async function getSecureComplaintDetails(complaintNo: string, contact: string): Promise<TrackingResult | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = complaintNo.trim();
  const contactStr = contact.trim();

  if (!searchStr || !contactStr) return null;

  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(`
      id, 
      complaint_no, 
      name, 
      mobile,
      email,
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

  if (error || !complaint) {
    return { found: false, type: "complaint", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

  // Security check: Must match registered mobile or email
  const matchMobile = complaint.mobile && complaint.mobile.trim() === contactStr;
  const matchEmail = complaint.email && complaint.email.toLowerCase().trim() === contactStr.toLowerCase();

  if (!matchMobile && !matchEmail) {
    return { found: false, type: "complaint", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

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

export async function getSecureCourseDetails(enrollmentNo: string, email: string): Promise<TrackingResult | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = enrollmentNo.trim();
  const emailStr = email.trim();

  if (!searchStr || !emailStr) return null;

  const { data: enrollment, error } = await supabase
    .from("course_registrations")
    .select(`
      id, 
      enrollment_no, 
      full_name, 
      email,
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

  if (error || !enrollment) {
    return { found: false, type: "enrollment", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

  // Security check: Must match registered email
  if (enrollment.email.toLowerCase().trim() !== emailStr.toLowerCase()) {
    return { found: false, type: "enrollment", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

  // Fetch the certificate details if status is APPROVED/COMPLETED
  let certificate = null;
  if (enrollment.status === "APPROVED" || enrollment.status === "COMPLETED") {
    const { data: certData } = await supabase
      .from("certificates")
      .select("certificate_no, pdf_url")
      .eq("registration_id", enrollment.id)
      .eq("status", "VALID")
      .maybeSingle();

    if (certData) {
      certificate = {
        certificate_no: certData.certificate_no,
        pdf_url: certData.pdf_url,
      };
    }
  }

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
    number: enrollment.enrollment_no || "",
    name: `${enrollment.full_name} (${(enrollment.courses as any)?.title || "Course"})`,
    status: enrollment.status,
    date: new Date(enrollment.created_at).toLocaleDateString("en-IN"),
    details: enrollment.remarks || undefined,
    timeline,
    certificate,
  };
  if (type === "appreciation") {
    const { data: app, error } = await supabase
      .from("appreciation_applications")
      .select(`
        id,
        application_no,
        full_name,
        social_work_field,
        description,
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
      .eq("application_no", searchStr)
      .maybeSingle();

    if (error || !app) {
      return { found: false, type: "appreciation", number: searchStr, name: "", status: "", date: "", timeline: [] };
    }

    const timeline = (app.status_logs || []).map((log: any) => ({
      id: log.id,
      fromStatus: log.from_status,
      toStatus: log.to_status,
      remarks: log.remarks || "No remarks available.",
      date: new Date(log.created_at).toLocaleString("en-IN"),
    })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let certificate = null;
    if (app.status === "APPROVED") {
      certificate = {
        certificate_no: app.application_no,
        pdf_url: `/track/appreciation/pdf?id=${app.application_no}`,
      };
    }

    return {
      found: true,
      type: "appreciation",
      number: app.application_no,
      name: `${app.full_name} (${app.social_work_field})`,
      status: app.status,
      date: new Date(app.created_at).toLocaleDateString("en-IN"),
      details: app.remarks || undefined,
      timeline,
      certificate
    };
  }

  return null;
}

export async function getCertificateVerificationDetails(certificateNo: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = certificateNo.trim();

  if (!searchStr) return null;

  const { data: cert, error } = await supabase
    .from("certificates")
    .select(`
      id,
      certificate_no,
      user_name,
      course_name,
      issue_date,
      status,
      pdf_url,
      grade,
      performance,
      venue,
      duration_from,
      duration_to
    `)
    .eq("certificate_no", searchStr)
    .maybeSingle();

  if (error || !cert) {
    return { found: false, certificate_no: searchStr };
  }

  return {
    found: true,
    certificate_no: cert.certificate_no,
    user_name: cert.user_name,
    course_name: cert.course_name,
    issue_date: new Date(cert.issue_date).toLocaleDateString("en-IN"),
    status: cert.status,
    pdf_url: cert.pdf_url,
    grade: cert.grade || "N/A",
    performance: cert.performance || "N/A",
    venue: cert.venue || "N/A",
    duration_from: cert.duration_from || "N/A",
    duration_to: cert.duration_to || "N/A"
  };
}

export async function getSecureAppreciationDetails(appNo: string, contact: string): Promise<TrackingResult | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = appNo.trim();
  const contactStr = contact.trim();

  if (!searchStr || !contactStr) return null;

  const { data: app, error } = await supabase
    .from("appreciation_applications")
    .select(`
      id,
      application_no,
      full_name,
      email,
      mobile,
      address,
      country,
      state,
      district,
      pincode,
      social_work_field,
      description,
      photo_url,
      status,
      created_at,
      approved_at,
      remarks,
      status_logs (
        id,
        from_status,
        to_status,
        remarks,
        created_at
      )
    `)
    .eq("application_no", searchStr)
    .maybeSingle();

  if (error || !app) {
    return { found: false, type: "appreciation", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

  // Security check: Must match registered mobile or email
  const matchMobile = app.mobile && app.mobile.trim() === contactStr;
  const matchEmail = app.email && app.email.toLowerCase().trim() === contactStr.toLowerCase();

  if (!matchMobile && !matchEmail) {
    return { found: false, type: "appreciation", number: searchStr, name: "", status: "", date: "", timeline: [] };
  }

  // Format timeline
  const timeline = (app.status_logs || []).map((log: any) => ({
    id: log.id,
    fromStatus: log.from_status,
    toStatus: log.to_status,
    remarks: log.remarks || "No remarks available.",
    date: new Date(log.created_at).toLocaleString("en-IN"),
  })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let certificate = null;
  if (app.status === "APPROVED") {
    certificate = {
      certificate_no: app.application_no,
      pdf_url: `/track/appreciation/pdf?id=${app.application_no}`,
    };
  }

  return {
    found: true,
    type: "appreciation",
    number: app.application_no,
    name: app.full_name,
    status: app.status,
    date: new Date(app.created_at).toLocaleDateString("en-IN"),
    details: app.remarks || undefined,
    timeline,
    certificate,
    memberDetails: {
      father_name: "",
      gender: "",
      dob: "",
      mobile: app.mobile,
      whatsapp: "",
      email: app.email,
      address: app.address,
      district: app.district,
      state: app.state,
      pincode: app.pincode,
      education: "",
      profession: "",
      working_area: app.social_work_field,
      designation: "Awardee",
      photo_url: app.photo_url,
      approved_at: app.approved_at,
      created_at: app.created_at,
      ack_no: app.application_no
    }
  };
}
