const fs = require('fs');

// Read the original file
const content = fs.readFileSync('frontend/src/constants/universities.js', 'utf8');

// Find the actual boundaries
const dataStartMarker = 'export const UNIVERSITY_DATA = {';
const dataStart = content.indexOf(dataStartMarker) + dataStartMarker.length;

const dataEndMarker = '\n};\n\n// Helper functions';
const dataEnd = content.indexOf(dataEndMarker);

const universitiesData = content.substring(dataStart, dataEnd);

console.log('Universities data length:', universitiesData.length);
console.log('Universities data start:', universitiesData.substring(0, 200));
console.log('Universities data end:', universitiesData.substring(universitiesData.length - 200));

// List of universities in alphabetical order
const sortedUniversities = [
  'Abia State University',
  'Abubakar Tafawa Balewa University',
  'Adamawa State University',
  'Adekunle Ajasin University',
  'Afe Babalola University',
  'Ahmadu Bello University',
  'Akwa Ibom State University',
  'Ambrose Alli University',
  'American University of Nigeria',
  'Anambra State University',
  'Bauchi State University',
  'Babcock University',
  'Bayero University Kano',
  'Baze University',
  'Benue State University',
  'Borno State University',
  'Bowen University',
  'Caleb University',
  'Covenant University',
  'Crawford University',
  'Cross River State University of Science & Technology',
  'Delta State University',
  'Ebonyi State University',
  'Ekiti State University',
  'Elizade University',
  'Enugu State University of Science and Technology',
  'Federal University of Technology Akure',
  'Federal University of Technology Minna',
  'Fountain University',
  'Gombe State University',
  'Igbinedion University',
  'Imo State University',
  'Joseph Ayo Babalola University',
  'Kaduna State University',
  'Kano State University of Science and Technology',
  'Kogi State University',
  'Kwara State University',
  'Lagos State University',
  'Landmark University',
  'Lead City University',
  'Madonna University',
  'Nasarawa State University',
  'National Open University of Nigeria',
  'Niger Delta University',
  'Nnamdi Azikiwe University',
  'Obafemi Awolowo University',
  'Ogun State University',
  'Ondo State University of Science and Technology',
  'Osun State University',
  'Plateau State University',
  'Renaissance University',
  'Rivers State University',
  'Salem University',
  'Sokoto State University',
  'Taraba State University',
  'University of Abuja',
  'University of Benin',
  'University of Calabar',
  'University of Ibadan',
  'University of Ilorin',
  'University of Jos',
  'University of Lagos',
  'University of Maiduguri',
  'University of Nigeria, Nsukka',
  'University of Port Harcourt',
  'University of Uyo',
  'Veritas University',
  'Wesley University',
  'Western Delta University',
  'Yobe State University',
  'Zamfara State University'
];

// Function to extract a university block from the data
function extractUniversity(data, universityName) {
  const startPattern = new RegExp(`  '${universityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}': \\{`, 'g');
  const startMatch = startPattern.exec(data);

  if (!startMatch) return null;

  const startIndex = startMatch.index;
  let braceCount = 0;
  let endIndex = startIndex;

  // Find the matching closing brace
  for (let i = startIndex; i < data.length; i++) {
    if (data[i] === '{') braceCount++;
    if (data[i] === '}') braceCount--;

    if (braceCount === 0 && i > startIndex) {
      endIndex = i;
      break;
    }
  }

  return data.substring(startIndex, endIndex + 1);
}

// Extract all universities
const extractedUniversities = [];
for (const uniName of sortedUniversities) {
  const uniBlock = extractUniversity(universitiesData, uniName);
  if (uniBlock) {
    extractedUniversities.push(uniBlock.trim());
  } else {
    console.log('Could not find university:', uniName);
  }
}

console.log(`Extracted ${extractedUniversities.length} universities`);

// Create the new content
let newContent = header;
extractedUniversities.forEach((uni, index) => {
  newContent += '\n  ' + uni;
  if (index < extractedUniversities.length - 1) {
    newContent += ',';
  } else {
    newContent += '\n';
  }
});
newContent += '};';
newContent += helpers;

// Write the new file
fs.writeFileSync('frontend/src/constants/universities_sorted.js', newContent);
console.log('Created sorted universities file');
