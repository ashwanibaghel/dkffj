const https = require("https");

function cleanApplicationNo(appNo) {
  if (!appNo) return "";
  let cleaned = appNo.replace(/DKFFJ\/A\/(\d{4})\/-\1-/g, "DKFFJ/A/$1/");
  cleaned = cleaned.replace(/DKFFJ\/A\/(\d{4})\/(\d{4})\//g, "DKFFJ/A/$1/");
  cleaned = cleaned.replace(/(\d{4})\/-\1-/g, "$1/");
  return cleaned;
}

const headers = {
  "apikey": "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n",
  "Authorization": "Bearer sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

function get(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://tgszzjbvpcznndrfkkov.supabase.co/rest/v1/${path}`, { headers }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(JSON.parse(body)));
    }).on("error", reject);
  });
}

function patch(path, bodyData) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://tgszzjbvpcznndrfkkov.supabase.co/rest/v1/${path}`, {
      method: "PATCH",
      headers
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(body));
    });
    req.on("error", reject);
    req.write(JSON.stringify(bodyData));
    req.end();
  });
}

async function main() {
  const records = await get("appreciation_applications?select=id,application_no");
  console.log(`Found ${records.length} appreciation application records.`);

  let updatedCount = 0;
  for (const rec of records) {
    const oldNo = rec.application_no;
    const newNo = cleanApplicationNo(oldNo);
    if (oldNo !== newNo) {
      console.log(`Updating ID ${rec.id}: "${oldNo}" -> "${newNo}"`);
      await patch(`appreciation_applications?id=eq.${rec.id}`, { application_no: newNo });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} appreciation application records in database!`);
}

main();
