// @ts-ignore
global.WebSocket = class DummyWebSocket {};

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Checking memberships...");
  const { data, count, error } = await supabase
    .from("memberships")
    .select("id, full_name, ack_no, status, created_at, is_migrated, role", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Total count in query: ${count}`);
    console.log("Top 30 most recent memberships:");
    data?.forEach((m, idx) => {
      console.log(`${idx + 1}. ID: ${m.id} | Name: ${m.full_name} | ACK: ${m.ack_no} | Status: ${m.status} | Date: ${m.created_at} | Migrated: ${m.is_migrated}`);
    });
  }

  const { data: comp } = await supabase.from("complaints").select("id, name, complaint_no, created_at").limit(10);
  console.log("\nComplaints count:", comp?.length || 0);
  comp?.forEach(c => console.log(" Complaint:", c));

  const { data: reg } = await supabase.from("course_registrations").select("id, full_name, created_at").limit(10);
  console.log("\nCourse registrations count:", reg?.length || 0);
  reg?.forEach(r => console.log(" Enrollment:", r));

  const { data: pay } = await supabase.from("payments").select("id, transaction_id, amount").limit(10);
  console.log("\nPayments count:", pay?.length || 0);
  pay?.forEach(p => console.log(" Payment:", p));
}

main();
