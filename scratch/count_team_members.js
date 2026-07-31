const fs = require('fs');

const content = fs.readFileSync('src/lib/teamData.ts', 'utf8');
const matches = content.match(/id:\s*["'](\d+)["']/g);

console.log("Total ID matches found in teamData.ts:", matches ? matches.length : 0);

if (matches) {
  const ids = matches.map(m => m.match(/\d+/)[0]);
  const uniqueIds = new Set(ids);
  console.log("Total unique IDs:", uniqueIds.size);
  console.log("First 10 IDs:", ids.slice(0, 10));
  console.log("Last 10 IDs:", ids.slice(-10));
}
