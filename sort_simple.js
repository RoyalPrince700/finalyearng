const fs = require('fs');

try {
  const content = fs.readFileSync('frontend/src/constants/universities.js', 'utf8');

  // Split the content into parts
  const beforeData = content.substring(0, content.indexOf('export const UNIVERSITY_DATA = {'));
  const afterData = content.substring(content.lastIndexOf('};\n\n// Helper functions'));

  // Extract the university data part
  const dataStart = content.indexOf('export const UNIVERSITY_DATA = {') + 'export const UNIVERSITY_DATA = {'.length;
  const dataEnd = content.indexOf('};\n\n// Helper functions');
  const dataPart = content.substring(dataStart, dataEnd);

  console.log('Data part length:', dataPart.length);
  console.log('Data part start:', dataPart.substring(0, 100));
  console.log('Data part end:', dataPart.substring(dataPart.length - 100));

  // Split by university entries (each starts with "  'University Name': {")
  const universities = [];
  const lines = dataPart.split('\n');
  let currentUni = '';
  let inUni = false;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^\s*'[^']+': \{$/)) {
      if (inUni) {
        // Save previous university
        universities.push(currentUni.trim());
      }
      currentUni = line + '\n';
      braceCount = 1;
      inUni = true;
    } else if (inUni) {
      currentUni += line + '\n';
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (braceCount === 0) {
        universities.push(currentUni.trim());
        inUni = false;
        currentUni = '';
      }
    }
  }

  if (currentUni.trim()) {
    universities.push(currentUni.trim());
  }

  console.log('Found', universities.length, 'universities');

  // Extract university names and sort
  const uniNames = universities.map(uni => {
    const match = uni.match(/^\s*'([^']+)':/);
    return match ? match[1] : '';
  });

  console.log('First few university names:', uniNames.slice(0, 5));

  // Sort universities by name
  const sortedUnis = universities.sort((a, b) => {
    const nameA = a.match(/^\s*'([^']+)':/)[1];
    const nameB = b.match(/^\s*'([^']+)':/)[1];
    return nameA.localeCompare(nameB);
  });

  // Reassemble the content
  let newData = 'export const UNIVERSITY_DATA = {\n';
  sortedUnis.forEach((uni, index) => {
    newData += '  ' + uni;
    if (index < sortedUnis.length - 1) {
      newData += ',\n';
    } else {
      newData += '\n';
    }
  });
  newData += '};\n\n';

  const finalContent = beforeData + newData + afterData;

  fs.writeFileSync('frontend/src/constants/universities.js', finalContent);
  console.log('Successfully sorted universities alphabetically!');

} catch (error) {
  console.error('Error:', error.message);
}
