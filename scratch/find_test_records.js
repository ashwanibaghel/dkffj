const fs = require('fs');

async function findTestRecords() {
  const envText = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
  const keyMatch = envText.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/);

  if (!urlMatch || !keyMatch) {
    console.error("Could not parse env vars");
    return;
  }

  const supabaseUrl = urlMatch[1];
  const apiKey = keyMatch[1];

  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const tables = ['memberships', 'complaints', 'course_registrations', 'payments', 'donations', 'certificates', 'appreciation_applications'];

  for (const t of tables) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${t}?select=*&order=created_at.desc&limit=15`, { headers });
    const data = await res.json();
    console.log(`\n=== TABLE: ${t} (${Array.isArray(data) ? data.length : 0} items) ===`);
    if (Array.isArray(data)) {
      data.forEach(item => {
        const name = item.full_name || item.name || item.user_name || item.applicant_name || 'N/A';
        const ack = item.ack_no || item.membership_no || item.complaint_no || item.enrollment_no || item.id;
        const date = item.created_at;
        console.log(` - ID: ${item.id} | Name: ${name} | Ack/No: ${ack} | Date: ${date}`);
      });
    } else {
      console.log("Error:", data);
    }
  }
}

findTestRecords();
