const fs = require('fs');
const path = require('path');

const filePath = path.join('E:', 'dkffj', 'dkffj-next', 'src', 'app', 'courses', 'CourseCard.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log('Searching for main return block in CourseCard.tsx...');
let count = 0;
lines.forEach((line, idx) => {
  if (line.includes('return') && !line.trim().startsWith('//')) {
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});
