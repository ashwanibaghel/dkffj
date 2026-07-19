require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

async function main() {
  const certNo = "DKCERT-2026-00019";
  const url = `https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/certificates/certs/cert_${certNo}.pdf`;
  
  console.log("Fetching URL:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    if (res.status === 200) {
      const buffer = await res.arrayBuffer();
      console.log("Downloaded size:", buffer.byteLength);
    } else {
      const text = await res.text();
      console.log("Error body:", text);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

main();
