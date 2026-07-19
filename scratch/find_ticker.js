const fs = require('fs');
const path = require('path');

const filePath = path.join('E:', 'dkffj', 'dkffj-next', 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for ticker keywords in page.tsx...');
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('ticker') || line.toLowerCase().includes('marquee') || line.toLowerCase().includes('news') || line.toLowerCase().includes('sliding')) {
    if (line.trim().length > 0 && line.trim().length < 150) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  }
});
