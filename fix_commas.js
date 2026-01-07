const fs = require('fs');

let content = fs.readFileSync('frontend/src/constants/universities.js', 'utf8');

// Remove lines that contain only whitespace and a comma
content = content.replace(/^\s*,\s*$/gm, '');

fs.writeFileSync('frontend/src/constants/universities.js', content);
console.log('Fixed extra commas in universities.js');
