const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');
const ws = require('ws');
global.WebSocket = ws;
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
function loadEnv(file) {
  const envPath = path.join(__dirname, '..', file);
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv('.env');
loadEnv('.env.local');

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration env variables.");
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("Authenticating as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@dkffj.org',
    password: 'AdminPassword123'
  });
  
  if (authError || !authData.session) {
    throw new Error(`Authentication failed: ${authError?.message}`);
  }
  console.log("Authenticated successfully!");
  
  console.log("Querying registration by enrollment number DKE-2026-00002...");
  const { data: reg, error: regError } = await supabase
    .from("course_registrations")
    .select("*")
    .eq("enrollment_no", "DKE-2026-00002")
    .single();
    
  if (regError || !reg) {
    throw new Error(`Failed to find registration: ${regError?.message}`);
  }
  console.log(`Found registration for: ${reg.full_name} (ID: ${reg.id})`);
  
  console.log("Deleting old certificates in database...");
  const { data: certDel, error: certError } = await supabase
    .from("certificates")
    .delete()
    .eq("registration_id", reg.id);
    
  if (certError) {
    console.warn("Failed to delete cert or none existed:", certError.message);
  } else {
    console.log("Old certificate deleted.");
  }
  
  console.log("Resetting status to APPROVED...");
  const { data: updatedReg, error: updateError } = await supabase
    .from("course_registrations")
    .update({ status: 'APPROVED' })
    .eq("id", reg.id)
    .select();
    
  if (updateError) {
    throw new Error(`Failed to update status: ${updateError.message}`);
  }
  
  console.log("Successfully reset status to APPROVED!");
}

main()
  .catch(e => console.error(e));
