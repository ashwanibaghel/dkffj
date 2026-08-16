import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { findDevAffiliationByAppNo } from "@/lib/affiliation-dev-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appNo = (searchParams.get("app") || "").trim().toUpperCase();
    const contact = (searchParams.get("contact") || "").trim().toLowerCase();

    if (!appNo || appNo.startsWith("AFF-DRAFT-")) {
      return NextResponse.json({ error: "No submitted application found for this reference. Draft applications cannot be tracked until payment is completed." }, { status: 404 });
    }
    if (!contact) {
      return NextResponse.json({ error: "Registered email address or mobile number is required to track an application." }, { status: 400 });
    }

    // 1. Check Dev Store strictly by Application Number or Affiliation Number
    const devItem = findDevAffiliationByAppNo(appNo);
    if (devItem) {
      if (devItem.status === "DRAFT") {
        return NextResponse.json({ error: "No submitted application found for this reference. Draft applications cannot be tracked until payment is completed." }, { status: 404 });
      }
      const matchEmail = devItem.applicant.email.toLowerCase() === contact;
      const matchMobile = devItem.applicant.mobile === contact;
      if (!matchEmail && !matchMobile) {
        return NextResponse.json({ error: "Registered email or mobile number does not match this application." }, { status: 403 });
      }

      const { getNormalizedCourseCatalog } = await import("@/lib/courseCatalog");
      const { courseMap } = await getNormalizedCourseCatalog(false);

      const reqIds = devItem.requestedCourseIds || [];
      const appIds = devItem.approvedCourseIds || (devItem.status === "APPROVED" ? reqIds : []);

      const approvedCourses = appIds.map(id => courseMap[id]).filter(Boolean);

      return NextResponse.json({
        id: devItem.id,
        applicationNo: devItem.applicationNo,
        affiliationNo: devItem.affiliationNo,
        organizationName: devItem.organizationName,
        organizationType: devItem.organizationTypeOther || devItem.organizationType,
        establishmentYear: devItem.establishmentYear,
        district: devItem.district,
        state: devItem.state,
        status: devItem.status,
        publicRemarks: devItem.publicRemarks,
        validFrom: devItem.validFrom ? new Date(devItem.validFrom).toLocaleDateString("en-IN") : null,
        validTo: devItem.validTo ? new Date(devItem.validTo).toLocaleDateString("en-IN") : null,
        applicantName: devItem.applicant.fullName,
        designation: devItem.applicant.designation,
        createdAt: devItem.createdAt,
        requestedCourseCount: reqIds.length,
        approvedCourseCount: appIds.length,
        approvedCourses,
        payment: devItem.payment ? {
          status: devItem.payment.status,
          amount: devItem.payment.amount,
          receiptNo: devItem.payment.receiptNo,
          refundId: devItem.payment.refundId,
          refundStatus: devItem.payment.refundStatus,
          refundedAt: devItem.payment.refundedAt
        } : null,
        timeline: devItem.timeline
      });
    }

    // 2. Query Supabase DB
    let affiliation: any = null;
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const { data, error } = await supabase
        .from("affiliations")
        .select("*, applicants:affiliation_applicants(*), status_logs(*)")
        .or(`application_no.ilike.${appNo},affiliation_no.ilike.${appNo}`)
        .maybeSingle();

      if (!error && data) {
        affiliation = data;
      }
    } catch (_) {}

    if (affiliation) {
      const applicant = Array.isArray(affiliation.applicants) ? affiliation.applicants[0] : affiliation.applicants;
      const statusLogs = Array.isArray(affiliation.status_logs) ? affiliation.status_logs : [];

      if (applicant) {
        const matchEmail = applicant.email?.toLowerCase() === contact;
        const matchMobile = applicant.mobile === contact;
        if (!matchEmail && !matchMobile) {
          return NextResponse.json({ error: "Registered email or mobile number does not match this application." }, { status: 403 });
        }
      }

      return NextResponse.json({
        applicationNo: affiliation.application_no,
        affiliationNo: affiliation.affiliation_no,
        organizationName: affiliation.organization_name,
        organizationType: affiliation.organization_type_other || affiliation.organization_type,
        establishmentYear: affiliation.establishment_year,
        district: affiliation.district,
        state: affiliation.state,
        status: affiliation.current_status,
        publicRemarks: affiliation.public_remarks,
        validFrom: affiliation.valid_from ? new Date(affiliation.valid_from).toLocaleDateString("en-IN") : null,
        validTo: affiliation.valid_to ? new Date(affiliation.valid_to).toLocaleDateString("en-IN") : null,
        applicantName: applicant?.full_name || "Applicant",
        designation: applicant?.designation || "Representative",
        createdAt: new Date(affiliation.created_at).toLocaleDateString("en-IN"),
        timeline: statusLogs.map((log: any) => ({
          toStatus: log.to_status,
          remarks: log.remarks,
          date: new Date(log.created_at).toLocaleDateString("en-IN")
        }))
      });
    }

    // 3. If not found in dev store or DB, return clean 404 error
    return NextResponse.json(
      { error: `No application found matching ${appNo}. Please check your application number or submit a new form.` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch tracking data." },
      { status: 500 }
    );
  }
}
