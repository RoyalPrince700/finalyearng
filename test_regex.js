const testLine = "  'Abia State University': {";
console.log('Test line:', testLine);
console.log('Regex match:', testLine.match(/^\s*'[^']+': \{$/));

const fs = require('fs');
const content = fs.readFileSync('frontend/src/constants/universities.js', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < Math.min(25, lines.length); i++) {
  const line = lines[i];
  if (line.match(/^\s*'[^']+': \{$/)) {
    console.log('Found match at line', i + 1, ':', line);
  }
}
