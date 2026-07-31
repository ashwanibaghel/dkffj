import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(process.cwd(), "..", "kelvinne_dkfound.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Regex to extract all tuples inserted into `membership_form`
  // Columns order from SQL schema:
  // 0: id, 1: member_no/id (e.g. 1101), 2: role/designation, 3: working_area, 4: state_id, 
  // 5: district_id, 6: block_id, 7: gram_panchayat, 8: name, 9: father_name, 
  // ... 24: mobile, 25: whatsapp, 26: email, 27: police_station, 28: photo, 29: aadhaar, 30: signature
  
  const insertRegex = /INSERT INTO `membership_form` VALUES\s*([\s\S]*?);/g;
  let match;
  const sqlMembers = new Map();

  while ((match = insertRegex.exec(sql)) !== null) {
    const valuesBlock = match[1];
    // Split tuples safely
    const tupleRegex = /\((.*?)\)(?:,|\s*;)/g;
    let tupleMatch;
    while ((tupleMatch = tupleRegex.exec(valuesBlock)) !== null) {
      const rowStr = tupleMatch[1];
      // Parse CSV-like fields inside tuple
      const fields = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === "'" && (i === 0 || rowStr[i-1] !== "\\")) {
          inQuote = !inQuote;
        } else if (char === "," && !inQuote) {
          fields.push(cur.trim().replace(/^'|'$/g, "").replace(/\\'/g, "'"));
          cur = "";
        } else {
          cur += char;
        }
      }
      if (cur) {
        fields.push(cur.trim().replace(/^'|'$/g, "").replace(/\\'/g, "'"));
      }

      if (fields.length >= 29) {
        const memberId = fields[1];
        const name = fields[8];
        const mobile = fields[24];
        const photo = fields[28];
        const aadhaar = fields[29];
        const signature = fields[30];
        const fatherName = fields[9];
        const education = fields[16];
        const address = fields[17];
        const district = fields[21];
        const pincode = fields[23];
        const email = fields[26];
        const designation = fields[2];
        const workingArea = fields[3];

        if (memberId) {
          sqlMembers.set(memberId, {
            memberId,
            name,
            mobile,
            photo: photo ? `/uploads/membership_form/${photo}` : "",
            aadhaar: aadhaar ? `/uploads/membership_form/${aadhaar}` : "",
            signature: signature ? `/uploads/membership_form/${signature}` : "",
            fatherName,
            education,
            address,
            district,
            pincode,
            email,
            designation,
            workingArea
          });
        }
      }
    }
  }

  console.log(`Extracted ${sqlMembers.size} member records from SQL dump.`);

  const leaders = await prisma.teamMember.findMany();
  let updatedCount = 0;
  let missingCount = 0;

  for (const leader of leaders) {
    const sqlData = sqlMembers.get(leader.id);
    let photoToSet = leader.photo;

    if (sqlData && sqlData.photo && sqlData.photo.trim() !== "") {
      photoToSet = sqlData.photo;
    }

    // Check if photo exists in uploads folder
    let photoExists = false;
    if (photoToSet && photoToSet.trim() !== "") {
      const localPath = path.join(process.cwd(), "public", photoToSet.replace(/^\//, ""));
      photoExists = fs.existsSync(localPath);
    }

    // Update leader details in DB
    const updateData = {};
    if (photoToSet && photoToSet !== leader.photo) {
      updateData.photo = photoToSet;
    }

    // Also enrich missing education, location, mobile if available from SQL
    if (sqlData) {
      if (!leader.education && sqlData.education) updateData.education = sqlData.education;
      if (!leader.location && (sqlData.district || sqlData.address)) updateData.location = sqlData.district || sqlData.address;
      if (!leader.mobile && sqlData.mobile) updateData.mobile = sqlData.mobile;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.teamMember.update({
        where: { id: leader.id },
        data: updateData
      });
      updatedCount++;
      console.log(`[UPDATED] ID: ${leader.id} | Name: ${leader.name} | Photo: ${photoToSet} (Exists on disk: ${photoExists})`);
    }

    if (!photoToSet || photoToSet.trim() === "") {
      missingCount++;
      console.log(`[STILL NO PHOTO] ID: ${leader.id} | Name: ${leader.name}`);
    }
  }

  console.log(`\n================ FINAL RESULT ================`);
  console.log(`Total Leaders: ${leaders.length}`);
  console.log(`Updated Records: ${updatedCount}`);
  console.log(`Leaders with Photos now: ${leaders.length - missingCount} / ${leaders.length}`);
  console.log(`Leaders without Photos: ${missingCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
