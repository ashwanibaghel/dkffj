import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Get or create seed user to satisfy foreign key user_id relation
    let user = await prisma.users.findFirst();
    if (!user) {
      user = await prisma.users.create({
        data: {
          id: "00000000-0000-0000-0000-000000000001",
          email: "test-user-seed@test-load.com",
          role: "USER",
          full_name: "Seed User"
        }
      });
    }

    const randomId = Math.floor(100000 + Math.random() * 900000);
    const membership = await prisma.memberships.create({
      data: {
        ack_no: `ACK-TEST-${randomId}-${Date.now()}`,
        membership_no: null,
        user_id: user.id,
        full_name: "Loadtest Membership",
        father_name: "Test Father",
        gender: "MALE",
        dob: new Date("1990-01-01"),
        mobile: "9999999999",
        whatsapp: "9999999999",
        email: `loadtest-${randomId}@test-load.com`,
        address: "123 Street Address",
        country: "India",
        state: "Delhi",
        district: "New Delhi",
        pincode: "110001",
        education: "Graduate",
        profession: "Business",
        working_area: "Delhi NCR",
        designation: "Welfare Secretary",
        police_station: "Connaught Place",
        photo_url: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/default.png",
        aadhaar_url: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/aadhaar/default.pdf",
        signature_url: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/default.png",
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, id: membership.id });
  } catch (error: any) {
    console.error("Test write membership error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
