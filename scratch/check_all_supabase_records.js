process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');

async function inspectAll() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
  const keyMatch = envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/);

  const supabaseUrl = urlMatch[1];
  const apiKey = keyMatch[1];

  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'count=exact'
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/memberships?select=id,full_name,ack_no,status,remarks,created_at&limit=1000`, { headers });
  const data = await res.json();

  if (Array.isArray(data)) {
    console.log(`TOTAL RECORDS FOUND IN SUPABASE MEMBERSHIPS: ${data.length}`);
    const execCount = data.filter(m => m.ack_no && m.ack_no.startsWith("DKF-EXEC-")).length;
    const phpCount = data.filter(m => m.remarks === "MIGRATED_PHP").length;
    const otherCount = data.length - execCount - phpCount;
    console.log(`- Executive Council (DKF-EXEC-): ${execCount}`);
    console.log(`- PHP Migrated (MIGRATED_PHP): ${phpCount}`);
    console.log(`- Other / New Records: ${otherCount}`);
  } else {
    console.log("Response:", data);
  }
}

inspectAll();
