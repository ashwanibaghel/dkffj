process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');

async function inspectAndClean() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
  const keyMatch = envText.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/);

  const supabaseUrl = urlMatch[1];
  const apiKey = keyMatch[1];

  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  console.log("=== INSPECTING RECENT MEMBERSHIPS ===");
  const res = await fetch(`${supabaseUrl}/rest/v1/memberships?select=id,full_name,ack_no,created_at,status,is_migrated,mobile,email&order=created_at.desc&limit=25`, { headers });
  const data = await res.json();

  if (Array.isArray(data)) {
    console.log(`Found ${data.length} recent memberships:`);
    data.forEach(m => {
      console.log(`ID: ${m.id} | Name: ${m.full_name} | ACK: ${m.ack_no} | Date: ${m.created_at} | Status: ${m.status} | Migrated: ${m.is_migrated}`);
    });
  } else {
    console.log("Response:", data);
  }
}

inspectAndClean();
