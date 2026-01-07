const fs = require('fs');

// Read the current file
const content = fs.readFileSync('frontend/src/constants/universities.js', 'utf8');

// Split into lines
const lines = content.split('\n');

// Find the start and end of UNIVERSITY_DATA
let dataStartLine = -1;
let dataEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const UNIVERSITY_DATA = {')) {
    dataStartLine = i;
  }
  if (lines[i].trim() === '};' && dataStartLine !== -1) {
    // Check if next non-empty line contains helper functions
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim();
      if (nextLine && nextLine.includes('// Helper functions')) {
        dataEndLine = i;
        break;
      }
      if (nextLine && !nextLine.startsWith('//')) break; // Stop if we hit non-comment content
    }
    if (dataEndLine !== -1) break;
  }
}

console.log('Data starts at line:', dataStartLine);
console.log('Data ends at line:', dataEndLine);

// Extract header, data, and footer
const headerLines = lines.slice(0, dataStartLine + 1);
const dataLines = lines.slice(dataStartLine + 1, dataEndLine);
const footerLines = lines.slice(dataEndLine);

console.log('Data lines count:', dataLines.length);

// Find all university blocks
const universities = [];
let currentUniLines = [];
let inUni = false;
let braceCount = 0;

for (let i = 0; i < dataLines.length; i++) {
  const line = dataLines[i];
  console.log(`Line ${i}: "${line.replace(/\r/g, '\\r').replace(/\n/g, '\\n').substring(0, 60)}"`);

  const match = line.match(/^\s*'[^']+': \{\s*$/);
  if (match) {
    console.log('Found university start at line', i, ':', JSON.stringify(line));
    if (inUni) {
      // Save previous university
      universities.push(currentUniLines);
    }
    currentUniLines = [line];
    braceCount = 1;
    inUni = true;
  } else if (inUni) {
    currentUniLines.push(line);
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
    console.log(`Brace count: ${braceCount}`);

    if (braceCount === 0) {
      universities.push(currentUniLines);
      inUni = false;
      currentUniLines = [];
    }
  }
}

if (currentUniLines.length > 0) {
  universities.push(currentUniLines);
}

console.log('Found universities:', universities.length);

// Extract university names and sort
const uniData = universities.map(lines => ({
  name: lines[0].match(/^\s*'([^']+)':/)[1],
  lines: lines
}));

uniData.sort((a, b) => a.name.localeCompare(b.name));

console.log('Sorted universities:');
uniData.forEach(uni => console.log(' -', uni.name));

// Rebuild the data section
const newDataLines = [];
uniData.forEach((uni, index) => {
  newDataLines.push(...uni.lines);
  if (index < uniData.length - 1) {
    newDataLines.push(',');
  }
});

// Rebuild the file
const newLines = [...headerLines, ...newDataLines, ...footerLines];
const newContent = newLines.join('\n');

fs.writeFileSync('frontend/src/constants/universities_sorted.js', newContent);
console.log('Created sorted universities file with', uniData.length, 'universities');
