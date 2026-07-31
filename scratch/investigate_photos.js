import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany();
  const memberships = await prisma.memberships.findMany();

  let parsedData = [];
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "..", "parsed_members.json"), "utf8");
    parsedData = JSON.parse(raw);
  } catch (e) {
    console.error("Could not read parsed_members.json:", e.message);
  }

  // Create lookup maps
  const membershipByMobile = new Map();
  const membershipByName = new Map();
  for (const m of memberships) {
    if (m.mobile) membershipByMobile.set(m.mobile.trim(), m);
    if (m.full_name) membershipByName.set(m.full_name.trim().toLowerCase(), m);
  }

  const jsonByMobile = new Map();
  const jsonByName = new Map();
  for (const item of parsedData) {
    if (item.mobile) jsonByMobile.set(String(item.mobile).trim(), item);
    if (item.name) jsonByName.set(String(item.name).trim().toLowerCase(), item);
  }

  let mPhotoCount = 0;
  let jPhotoCount = 0;
  let detailsMatched = 0;

  const results = [];

  for (const l of leaders) {
    const mMatch = (l.mobile && membershipByMobile.get(l.mobile.trim())) || membershipByName.get(l.name.trim().toLowerCase());
    const jMatch = (l.mobile && jsonByMobile.get(l.mobile.trim())) || jsonByName.get(l.name.trim().toLowerCase());

    const hasMPhoto = mMatch && mMatch.photo_url && mMatch.photo_url.trim() !== "";
    const hasJPhoto = jMatch && (jMatch.photo || jMatch.photo_url) && (jMatch.photo || jMatch.photo_url).trim() !== "";

    if (hasMPhoto) mPhotoCount++;
    if (hasJPhoto) jPhotoCount++;

    results.push({
      id: l.id,
      name: l.name,
      mobile: l.mobile,
      currentPhoto: l.photo,
      mMatchPhoto: mMatch ? mMatch.photo_url : null,
      jMatchPhoto: jMatch ? (jMatch.photo || jMatch.photo_url) : null
    });
  }

  const output = [
    `Total leaders: ${leaders.length}`,
    `Leaders matching photos in memberships (Supabase): ${mPhotoCount}`,
    `Leaders matching photos in parsed_members.json: ${jPhotoCount}`,
    `Sample matches:`,
    JSON.stringify(results.slice(0, 10), null, 2)
  ].join("\n");

  fs.writeFileSync(path.join(process.cwd(), "scratch", "inv_out.txt"), output);
  console.log("Done writing inv_out.txt");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
