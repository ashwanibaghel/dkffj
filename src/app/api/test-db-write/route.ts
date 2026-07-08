import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const complaint = await prisma.complaints.create({
      data: {
        complaint_no: `TEST-${randomId}-${Date.now()}`,
        name: "Loadtest User",
        father_name: "Test Father",
        gender: "MALE",
        mobile: "9999999999",
        email: `loadtest-${randomId}@test-load.com`,
        address: "123 Load Test St",
        country: "India",
        state: "Delhi",
        district: "New Delhi",
        police_station: "Connaught Place",
        details: "LOADTEST_BODY_DUMMY_RECORD",
        status: "SUBMITTED"
      }
    });

    return NextResponse.json({ success: true, id: complaint.id });
  } catch (error: any) {
    console.error("Test write error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
