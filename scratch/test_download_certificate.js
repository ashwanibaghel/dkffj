const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const certNo = "DKCERT-2026-00019";
  const pdfPath = `certs/cert_${certNo}.pdf`;
  
  console.log(`Checking if ${pdfPath} exists and downloading...`);
  
  const { data, error } = await supabase.storage
    .from("certificates")
    .download(pdfPath);

  if (error) {
    console.error("Download failed:", error);
  } else {
    console.log("Download successful! Blob size:", data.size);
  }
}

main();
