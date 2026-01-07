const fs = require('fs');
const content = fs.readFileSync('frontend/src/constants/universities.js', 'utf8');

const universities = {};
let currentUniversity = null;
let currentData = '';
let braceCount = 0;
let inUniversity = false;

const lines = content.split('\n');
console.log('Total lines:', lines.length);
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  console.log(`Line ${i}:`, JSON.stringify(line));

  if (line.includes('export const UNIVERSITY_DATA = {')) {
    console.log('Found UNIVERSITY_DATA declaration');
    continue;
  }

  if (line.match(/^\s*'[^']+': \{\s*$/)) {
    console.log('Found university line at', i, ':', line);
    console.log('Found university line:', line);
    currentUniversity = line.trim().match(/^'([^']+)':/)[1];
    currentData = line + '\n';
    braceCount = 1;
    inUniversity = true;
  } else if (inUniversity) {
    currentData += line + '\n';
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceCount += openBraces;
    braceCount -= closeBraces;
    if (openBraces > 0 || closeBraces > 0) {
      console.log(`Line ${i}: braceCount=${braceCount}, open=${openBraces}, close=${closeBraces}`);
    }

    if (braceCount === 0) {
      console.log('Brace count reached 0 for', currentUniversity);
      universities[currentUniversity] = currentData.trim();
      inUniversity = false;
    }
  }
}

const sortedUniversities = Object.keys(universities).sort();

let newContent = '// University data structure for scalability\n';
newContent += '// This file contains all university, faculty, and department information\n';
newContent += '//\n';
newContent += '// To add a new university:\n';
newContent += '// 1. Add a new key with the university name\n';
newContent += '// 2. Add faculties object with faculty names as keys\n';
newContent += '// 3. Add departments arrays for each faculty\n';
newContent += '//\n';
newContent += '// Example:\n';
newContent += '// \'New University\': {\n';
newContent += '//   faculties: {\n';
newContent += '//     \'Faculty of Science\': [\'Computer Science\', \'Mathematics\'],\n';
newContent += '//     \'Faculty of Arts\': [\'English\', \'History\']\n';
newContent += '//   }\n';
newContent += '// }\n';
newContent += '\n';
newContent += 'export const UNIVERSITY_DATA = {\n';

for (let i = 0; i < sortedUniversities.length; i++) {
  newContent += '  ' + universities[sortedUniversities[i]];
  if (i < sortedUniversities.length - 1) {
    newContent += ',\n';
  } else {
    newContent += '\n';
  }
}

newContent += '};\n';
newContent += '\n';
newContent += '// Helper functions for working with university data\n';
newContent += 'export const getUniversities = () => Object.keys(UNIVERSITY_DATA);\n';
newContent += '\n';
newContent += 'export const getFaculties = (university) => {\n';
newContent += '  return university && UNIVERSITY_DATA[university]\n';
newContent += '    ? Object.keys(UNIVERSITY_DATA[university].faculties)\n';
newContent += '    : [];\n';
newContent += '};\n';
newContent += '\n';
newContent += 'export const getDepartments = (university, faculty) => {\n';
newContent += '  return university && faculty && UNIVERSITY_DATA[university]?.faculties[faculty]\n';
newContent += '    ? UNIVERSITY_DATA[university].faculties[faculty]\n';
newContent += '    : [];\n';
newContent += '};\n';

fs.writeFileSync('frontend/src/constants/universities_sorted.js', newContent);
console.log('Sorted universities file created successfully');
console.log('Total universities:', sortedUniversities.length);
