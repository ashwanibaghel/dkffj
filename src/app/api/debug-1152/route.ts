import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Query via Supabase
    const { data: supaMembers, error: supaErr } = await supabase
      .from("memberships")
      .select("id, membership_no, ack_no, full_name, status, mobile, email")
      .or("membership_no.ilike.*1152*,ack_no.ilike.*1152*,email.eq.khaleekqadrirazvialvi@gmail.com");

    // Query via Prisma
    const prismaMembers = await prisma.memberships.findMany({
      where: {
        OR: [
          { membership_no: { contains: "1152" } },
          { ack_no: { contains: "1152" } },
          { email: "khaleekqadrirazvialvi@gmail.com" }
        ]
      }
    });

    return NextResponse.json({
      supaMembers,
      supaErr,
      prismaMembersCount: prismaMembers.length,
      prismaMembers
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
