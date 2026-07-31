import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany();
  const memberships = await prisma.memberships.findMany();

  // Read SQL file if needed
  const sqlPath = path.join(process.cwd(), "..", "kelvinne_dkfound.sql");
  let sqlContent = "";
  if (fs.existsSync(sqlPath)) {
    sqlContent = fs.readFileSync(sqlPath, "utf8");
  }

  // Create maps from memberships
  const membershipByMobile = new Map();
  const membershipByName = new Map();
  for (const m of memberships) {
    if (m.mobile) membershipByMobile.set(m.mobile.trim(), m);
    if (m.full_name) membershipByName.set(m.full_name.trim().toLowerCase(), m);
  }

  let updatedCount = 0;
  let remainingMissing = 0;

  console.log(`Starting photo repair for ${leaders.length} leaders...`);

  for (const leader of leaders) {
    let photoToSet = leader.photo;

    if (!photoToSet || photoToSet.trim() === "") {
      // 1. Try matching with memberships table in Supabase
      const mMatch = (leader.mobile && membershipByMobile.get(leader.mobile.trim())) || membershipByName.get(leader.name.trim().toLowerCase());
      if (mMatch && mMatch.photo_url && mMatch.photo_url.trim() !== "") {
        photoToSet = mMatch.photo_url;
      }
    }

    // 2. If still no photo, search SQL file for mobile or name
    if (!photoToSet || photoToSet.trim() === "") {
      if (leader.mobile && sqlContent.includes(leader.mobile.trim())) {
        // Regex search in SQL dump for photo filename associated with mobile
        const regex = new RegExp(`'${leader.mobile.trim()}'.*?('17\\d+\\.(?:jpg|jpeg|png)'|'WhatsApp_\\d+.*?'|'IMG-.*?')`, "i");
        const match = sqlContent.match(regex);
        if (match && match[1]) {
          const filename = match[1].replace(/'/g, "");
          photoToSet = `/uploads/membership_form/${filename}`;
        }
      }
    }

    // 3. Update leader photo if found
    if (photoToSet && photoToSet.trim() !== "" && photoToSet !== leader.photo) {
      await prisma.teamMember.update({
        where: { id: leader.id },
        data: { photo: photoToSet }
      });
      updatedCount++;
      console.log(`[UPDATED PHOTO] ID: ${leader.id} | Name: ${leader.name} -> ${photoToSet}`);
    } else if (!photoToSet || photoToSet.trim() === "") {
      remainingMissing++;
      console.log(`[STILL MISSING PHOTO] ID: ${leader.id} | Name: ${leader.name} | Mobile: ${leader.mobile}`);
    }
  }

  console.log(`\n================ Summary ================`);
  console.log(`Successfully updated photos for: ${updatedCount} leaders`);
  console.log(`Remaining leaders without photo: ${remainingMissing}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
