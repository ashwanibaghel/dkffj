import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany();
  const memberships = await prisma.memberships.findMany();

  let overlapCount = 0;
  let newCount = 0;

  const sampleOverlaps = [];

  for (const l of leaders) {
    const ackNo = `DKE-EXEC-${l.id}`;
    const mobile = l.mobile ? l.mobile.trim() : "";
    const name = l.name ? l.name.trim().toLowerCase() : "";

    const match = memberships.find(m =>
      m.ack_no === ackNo ||
      (mobile && m.mobile && m.mobile.trim() === mobile) ||
      (name && m.full_name && m.full_name.trim().toLowerCase() === name)
    );

    if (match && match.ack_no !== ackNo) {
      overlapCount++;
      if (sampleOverlaps.length < 5) {
        sampleOverlaps.push({ leaderName: l.name, leaderMobile: l.mobile, existingMemberName: match.full_name, existingMemberMobile: match.mobile, ackNo: match.ack_no });
      }
    } else {
      newCount++;
    }
  }

  const out = `Total Executive Council Leaders: ${leaders.length}\nTotal Memberships in DB: ${memberships.length}\n\nLeaders ALREADY present in Member Desk before migration: ${overlapCount}\nLeaders newly created during migration: ${newCount}\n\nSample Common Members (Executive Council & Member Desk both):\n${JSON.stringify(sampleOverlaps, null, 2)}`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "count_explanation.txt"), out);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
