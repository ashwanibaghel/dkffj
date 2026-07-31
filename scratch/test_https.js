const https = require('https');
const fs = require('fs');

const envText = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
const keyMatch = envText.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/);

const hostname = urlMatch[1].replace('https://', '').replace('/', '');
const apiKey = keyMatch[1];

function fetchTable(table) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: `/rest/v1/${table}?select=id,full_name,name,user_name,ack_no,created_at&order=created_at.desc&limit=10`,
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ table, status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ table, status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (e) => resolve({ table, error: e.message }));
    req.end();
  });
}

async function run() {
  const tables = ['memberships', 'complaints', 'course_registrations', 'payments', 'donations', 'certificates', 'appreciation_applications'];
  for (const t of tables) {
    const res = await fetchTable(t);
    console.log(`\n=== TABLE ${t} (status: ${res.status}) ===`);
    if (res.data && Array.isArray(res.data)) {
      console.log(`Records found: ${res.data.length}`);
      res.data.forEach(item => {
        console.log(` - ID: ${item.id} | Name: ${item.full_name || item.name || item.user_name || 'N/A'} | Date: ${item.created_at}`);
      });
    } else {
      console.log("Response:", res.data || res.error || res.raw);
    }
  }
}

run();
