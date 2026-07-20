import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const MIGRATION_SECRET = "DKFFJ_MIGRATION_SECRET_2026";
const DEFAULT_PASSWORD = "Member@dkffj123";

type MigratedMember = {
  id_no: string;
  enroll_me: string;
  working_area: string;
  state: string;
  state2?: string;
  zone: string;
  distric: string;
  distric2?: string;
  tehsil: string;
  tehsil2?: string;
  frstname: string;
  fathername: string;
  surname: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  profession: string;
  education: string;
  address: string;
  pincode: string;
  mobile: string;
  whatsapp_no: string;
  email: string;
  polic_station: string;
  aadahr_card_url: string; // Storage path or URL
  user_photo_url: string;
  user_signature_url: string;
  addeddate: string; // YYYY-MM-DD
  status: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, members } = body as { secret: string; members: MigratedMember[] };

    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!members || !Array.isArray(members)) {
      return NextResponse.json({ error: "Invalid members list" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const results = {
      total: members.length,
      migrated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const m of members) {
      try {
        const cleanEmail = m.email.trim().toLowerCase();
        const cleanMobile = m.mobile.replace(/\s+/g, "").trim();

        if (!cleanEmail || !cleanMobile) {
          results.skipped++;
          continue;
        }

        // 1. Check if user already exists in memberships
        const existingMember = await prisma.memberships.findFirst({
          where: {
            OR: [
              { email: { equals: cleanEmail, mode: "insensitive" } },
              { mobile: cleanMobile }
            ]
          }
        });

        if (existingMember) {
          results.skipped++;
          continue;
        }

        // 2. Register user in auth.users via RPC
        const { data: createdUserId, error: dbRegError } = await supabase.rpc("create_auth_user", {
          p_email: cleanEmail,
          p_password: DEFAULT_PASSWORD,
          p_full_name: m.frstname.trim()
        });

        if (dbRegError || !createdUserId) {
          console.error(`Failed to register user ${cleanEmail}:`, dbRegError);
          results.errors.push(`Auth Error for ${cleanEmail}: ${dbRegError?.message || "unknown"}`);
          continue;
        }

        const userId = createdUserId as string;

        // 3. Normalize dob and addeddate
        const dobDate = new Date(m.dob || "1980-01-01");
        const createdAtDate = new Date(m.addeddate || new Date());

        // 4. Create membership record in PostgreSQL
        // Membership No: DKM-<id_no> (e.g. DKM-1000)
        const membershipNo = `DKM-${m.id_no}`;
        const ackNo = `DKE-MIG-${m.id_no}`;

        await prisma.memberships.create({
          data: {
            membership_no: membershipNo,
            ack_no: ackNo,
            user_id: userId,
            full_name: m.frstname.trim(),
            father_name: m.fathername.trim() || "N/A",
            gender: m.gender || "Male",
            dob: dobDate,
            mobile: cleanMobile,
            whatsapp: m.whatsapp_no.replace(/\s+/g, "").trim() || cleanMobile,
            email: cleanEmail,
            address: m.address.trim() || "N/A",
            country: "India",
            district: m.distric.trim() || "N/A",
            state: m.state2?.trim() || m.state.trim() || "N/A",
            pincode: m.pincode.trim() || "000000",
            education: m.education.trim() || "N/A",
            profession: m.profession.trim() || "N/A",
            working_area: m.working_area.trim() || "N/A",
            designation: m.enroll_me.trim() || "Member",
            police_station: m.polic_station.trim() || "N/A",
            photo_url: m.user_photo_url || "photos/default.png",
            aadhaar_url: m.aadahr_card_url || "aadhaar/default.png",
            signature_url: m.user_signature_url || "signatures/default.png",
            status: m.status === 1 ? "APPROVED" : "PENDING",
            remarks: "MIGRATED_PHP",
            created_at: createdAtDate,
            updated_at: new Date()
          }
        });

        results.migrated++;
      } catch (err: any) {
        console.error(`Error migrating member ${m.frstname}:`, err);
        results.errors.push(`DB Error for ${m.frstname}: ${err.message || err}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Migration DB exception:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
