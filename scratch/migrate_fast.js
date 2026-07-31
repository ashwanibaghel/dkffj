import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Running fast migration...");
  const leaders = await prisma.teamMember.findMany();
  const existingMemberships = await prisma.memberships.findMany();

  const firstUser = await prisma.users.findFirst({ where: { role: "ADMIN" } });
  const adminUserId = firstUser ? firstUser.id : "00000000-0000-0000-0000-000000000000";

  const memberByMobile = new Map();
  const memberByName = new Map();
  const memberByAck = new Map();

  for (const m of existingMemberships) {
    if (m.mobile) memberByMobile.set(m.mobile.trim(), m);
    if (m.full_name) memberByName.set(m.full_name.trim().toLowerCase(), m);
    if (m.ack_no) memberByAck.set(m.ack_no, m);
  }

  let updated = 0;
  let created = 0;

  for (const leader of leaders) {
    const ackNo = `DKE-EXEC-${leader.id}`;
    const mMatch = memberByAck.get(ackNo) || 
                   (leader.mobile && memberByMobile.get(leader.mobile.trim())) || 
                   memberByName.get(leader.name.trim().toLowerCase());

    const isHome = leader.showHome === 1;
    const isApproved = leader.status === 1;

    if (mMatch) {
      await prisma.memberships.update({
        where: { id: mMatch.id },
        data: {
          show_home: isHome,
          ...(leader.photo && (!mMatch.photo_url || mMatch.photo_url === "") && { photo_url: leader.photo }),
          ...(leader.role && (!mMatch.designation || mMatch.designation === "Member") && { designation: leader.role })
        }
      });
      updated++;
    } else {
      const cleanMobile = leader.mobile ? leader.mobile.replace(/\D/g, "").slice(-10) : "";
      const validMobile = cleanMobile.length === 10 ? cleanMobile : `900000${String(leader.id).padStart(4, '0')}`.slice(0, 10);

      try {
        await prisma.memberships.create({
          data: {
            ack_no: ackNo,
            membership_no: `DKFFJ/M/EXEC/${leader.id}`,
            user_id: adminUserId,
            full_name: leader.name.trim(),
            father_name: "Executive Board",
            gender: "Male",
            dob: new Date("1990-01-01"),
            mobile: validMobile,
            whatsapp: validMobile,
            email: `leader_${leader.id}@dkffj.org`,
            address: leader.location || "India",
            district: leader.location || "Kanpur",
            state: "Uttar Pradesh",
            pincode: "208019",
            education: leader.education || "Graduate",
            profession: "Social Worker",
            working_area: "Human Rights",
            designation: leader.role || "Executive Member",
            photo_url: leader.photo || "",
            aadhaar_url: "",
            signature_url: "",
            status: isApproved ? "APPROVED" : "REJECTED",
            show_home: isHome,
            remarks: "Migrated from Executive Council Board Registry"
          }
        });
        created++;
      } catch (err) {
        console.error(`Failed to create membership for leader ${leader.id}:`, err.message);
      }
    }
  }

  const finalCount = await prisma.memberships.count();
  const summary = `Fast Migration Done!\nUpdated: ${updated}\nCreated: ${created}\nTotal Memberships in DB: ${finalCount}`;
  console.log(summary);
  fs.writeFileSync(path.join(process.cwd(), "scratch", "fast_res.txt"), summary);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
