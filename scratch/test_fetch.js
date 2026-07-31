import "dotenv/config";
import https from "https";
import fs from "fs";

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL.trim()}/rest/v1/memberships?select=*&order=id.desc`;
console.log("Fetching from URL:", url);

const req = https.get(url, {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim(),
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim()}`
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Response status:", res.statusCode);
    const data = JSON.parse(body);
    console.log("Total members fetched:", data.length);
    fs.writeFileSync("scratch/supabase_data.json", JSON.stringify(data, null, 2));
  });
});

req.on('error', err => console.error("HTTPS Error:", err));
