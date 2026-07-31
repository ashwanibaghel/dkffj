import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration of Executive Council leaders to memberships table...");

  const leaders = await prisma.teamMember.findMany();
  const existingMemberships = await prisma.memberships.findMany();

  console.log(`Found ${leaders.length} leaders in teamMember.`);
  console.log(`Found ${existingMemberships.length} existing records in memberships.`);

  // Find a valid user_id for approvals/user references
  const firstUser = await prisma.users.findFirst({ where: { role: "ADMIN" } });
  const adminUserId = firstUser ? firstUser.id : "00000000-0000-0000-0000-000000000000";

  // Maps for checking existence
  const memberByMobile = new Map();
  const memberByName = new Map();
  const memberByAck = new Map();

  for (const m of existingMemberships) {
    if (m.mobile) memberByMobile.set(m.mobile.trim(), m);
    if (m.full_name) memberByName.set(m.full_name.trim().toLowerCase(), m);
    if (m.ack_no) memberByAck.set(m.ack_no, m);
  }

  let insertedCount = 0;
  let updatedCount = 0;

  for (const leader of leaders) {
    const ackNo = `DKE-EXEC-${leader.id}`;
    const mMatch = memberByAck.get(ackNo) || 
                   (leader.mobile && memberByMobile.get(leader.mobile.trim())) || 
                   memberByName.get(leader.name.trim().toLowerCase());

    const isHome = leader.showHome === 1;
    const isApproved = leader.status === 1;

    if (mMatch) {
      // Update existing membership record with show_home and photo if missing
      await prisma.memberships.update({
        where: { id: mMatch.id },
        data: {
          show_home: isHome,
          ...(leader.photo && (!mMatch.photo_url || mMatch.photo_url === "") && { photo_url: leader.photo }),
          ...(leader.role && (!mMatch.designation || mMatch.designation === "Member") && { designation: leader.role })
        }
      });
      updatedCount++;
    } else {
      // Create new membership record
      const cleanMobile = leader.mobile ? leader.mobile.replace(/\D/g, "").slice(-10) : "";
      const validMobile = cleanMobile.length === 10 ? cleanMobile : `900000${String(leader.id).padStart(4, '0')}`.slice(0, 10);

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
      insertedCount++;
    }
  }

  const finalMembershipsCount = await prisma.memberships.count();

  const out = `Migration Completed Successfully!\nTotal Leaders: ${leaders.length}\nNewly Inserted Memberships: ${insertedCount}\nUpdated Existing Memberships: ${updatedCount}\nTotal Memberships in DB now: ${finalMembershipsCount}`;
  console.log(out);
  fs.writeFileSync(path.join(process.cwd(), "scratch", "migration_res.txt"), out);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
