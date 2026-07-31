import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const allMembers = await prisma.memberships.findMany({
    orderBy: { id: "desc" }
  });

  console.log(`Total memberships in DB: ${allMembers.length}`);

  // Count by remarks / ack prefix
  const remarksCount = {};
  for (const m of allMembers) {
    const rem = m.remarks || "NO_REMARKS";
    remarksCount[rem] = (remarksCount[rem] || 0) + 1;
  }
  console.log("Memberships breakdown by remarks:", remarksCount);

  // Find Duplicate Mobiles
  const mobileGroups = {};
  for (const m of allMembers) {
    if (m.mobile && m.mobile.trim()) {
      const mob = m.mobile.trim();
      if (!mobileGroups[mob]) mobileGroups[mob] = [];
      mobileGroups[mob].push(m);
    }
  }

  const dupMobiles = Object.entries(mobileGroups).filter(([_, list]) => list.length > 1);
  console.log(`\nFound ${dupMobiles.length} duplicate mobile numbers:`);
  for (const [mob, list] of dupMobiles) {
    console.log(`Mobile: ${mob} (Count: ${list.length})`);
    for (const m of list) {
      console.log(`  - ID: ${m.id} | Ack: ${m.ack_no} | MemNo: ${m.membership_no} | Name: ${m.full_name} | Address: ${m.permanent_address}`);
    }
  }

  // Find Duplicate Names
  const nameGroups = {};
  for (const m of allMembers) {
    if (m.full_name && m.full_name.trim()) {
      const nm = m.full_name.trim().toLowerCase();
      if (!nameGroups[nm]) nameGroups[nm] = [];
      nameGroups[nm].push(m);
    }
  }

  const dupNames = Object.entries(nameGroups).filter(([_, list]) => list.length > 1);
  console.log(`\nFound ${dupNames.length} duplicate names:`);
  for (const [nm, list] of dupNames.slice(0, 10)) {
    console.log(`Name: ${nm} (Count: ${list.length})`);
    for (const m of list) {
      console.log(`  - ID: ${m.id} | Ack: ${m.ack_no} | MemNo: ${m.membership_no} | Mobile: ${m.mobile} | Address: ${m.permanent_address}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
