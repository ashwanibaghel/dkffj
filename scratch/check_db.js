const fs = require('fs');

async function checkViaRest() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
  const keyMatch = envText.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/);

  if (!urlMatch || !keyMatch) {
    console.error("Could not parse env vars");
    return;
  }

  const supabaseUrl = urlMatch[1];
  const apiKey = keyMatch[1];

  const tables = [
    'certificates',
    'course_registrations',
    'payments',
    'donations',
    'appreciation_applications',
    'complaints',
    'memberships'
  ];

  console.log("=== SUPABASE DIRECT REST TABLE COUNTS ===");

  for (const t of tables) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${t}?select=id`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Range-Unit': 'items',
        'Prefer': 'count=exact'
      }
    });

    const contentRange = res.headers.get('content-range');
    const data = await res.json();
    console.log(`Table '${t}': Count = ${contentRange || data.length}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`  Sample ID: ${data[0].id}`);
    }
  }
}

checkViaRest();
