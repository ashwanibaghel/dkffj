const https = require('https');
const fs = require('fs');

const envText = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envText.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
const keyMatch = envText.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || envText.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/);

const hostname = urlMatch[1].replace('https://', '').replace('/', '');
const apiKey = keyMatch[1];

function checkMembershipsCount() {
  const options = {
    hostname: hostname,
    port: 443,
    path: `/rest/v1/memberships?select=id,full_name,ack_no,membership_no,status,remarks,is_migrated`,
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Prefer': 'count=exact',
      'Range-Unit': 'items',
      'Range': '0-1000'
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        const contentRange = res.headers['content-range'];
        console.log(`=== MEMBERSHIPS TABLE DIRECT SUPABASE COUNT ===`);
        console.log(`Content-Range Header: ${contentRange}`);
        console.log(`Rows returned in array: ${Array.isArray(data) ? data.length : 0}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`First 5 rows:`, data.slice(0, 5));
          console.log(`Last 5 rows:`, data.slice(-5));
        }
      } catch (e) {
        console.log("Parsing error:", e, body);
      }
    });
  });

  req.on('error', (e) => console.log("Request error:", e));
  req.end();
}

checkMembershipsCount();
