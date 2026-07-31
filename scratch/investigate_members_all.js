import "dotenv/config";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

async function main() {
  const url = `${supabaseUrl}/rest/v1/memberships?select=*&order=id.desc`;
  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  if (!res.ok) {
    console.error("Fetch failed:", res.status, res.statusText, await res.text());
    return;
  }

  const allMembers = await res.json();
  console.log(`Total rows in memberships table: ${allMembers.length}`);

  const byAckPrefix = {};
  for (const m of allMembers) {
    const prefix = m.ack_no ? m.ack_no.split("-").slice(0, 2).join("-") : "NO_ACK";
    byAckPrefix[prefix] = (byAckPrefix[prefix] || 0) + 1;
  }

  // Check for duplicates by mobile and by full_name
  const mobileMap = {};
  const nameMap = {};
  const duplicatesByMobile = [];
  const duplicatesByName = [];

  for (const m of allMembers) {
    if (m.mobile && m.mobile.trim()) {
      const mob = m.mobile.trim();
      if (!mobileMap[mob]) mobileMap[mob] = [];
      mobileMap[mob].push(m);
    }
    if (m.full_name && m.full_name.trim()) {
      const nm = m.full_name.trim().toLowerCase();
      if (!nameMap[nm]) nameMap[nm] = [];
      nameMap[nm].push(m);
    }
  }

  for (const [mob, list] of Object.entries(mobileMap)) {
    if (list.length > 1) {
      duplicatesByMobile.push({ mobile: mob, count: list.length, members: list.map(x => ({ id: x.id, ack: x.ack_no, name: x.full_name, memNo: x.membership_no })) });
    }
  }

  for (const [nm, list] of Object.entries(nameMap)) {
    if (list.length > 1) {
      duplicatesByName.push({ name: nm, count: list.length, members: list.map(x => ({ id: x.id, ack: x.ack_no, mobile: x.mobile, address: x.permanent_address })) });
    }
  }

  const resultStr = `Total rows: ${allMembers.length}\nBreakdown: ${JSON.stringify(byAckPrefix, null, 2)}\nDuplicates by Mobile: ${duplicatesByMobile.length}\nDuplicates by Name: ${duplicatesByName.length}\n\nSample Duplicates by Name:\n${JSON.stringify(duplicatesByName.slice(0, 10), null, 2)}`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "supabase_inspect.txt"), resultStr);
  console.log("Successfully written results to scratch/supabase_inspect.txt");
}

main();
