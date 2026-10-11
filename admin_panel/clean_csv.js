const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Load the dirty CSV file
const inputFile = path.join(__dirname, 'dirty.csv');
const outputFile = path.join(__dirname, 'clean_interns.csv');

if (!fs.existsSync(inputFile)) {
  console.error(`\x1b[31mError: 'dirty.csv' not found!\x1b[0m`);
  console.log(`Please copy your downloaded CSV file into the project folder "${__dirname}" and rename it to "dirty.csv"`);
  process.exit(1);
}

console.log(`Reading ${inputFile}...`);
const fileContent = fs.readFileSync(inputFile, 'utf8');

// Parse the file using XLSX library (already in node_modules)
const workbook = XLSX.read(fileContent, { type: 'string' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

if (rawRows.length === 0) {
  console.error("The CSV file is empty!");
  process.exit(1);
}

const headers = rawRows[0];
const rows = rawRows.slice(1);

// Identify column mappings based on sheet headers
const columnMappings = {
  full_name: ['full name', 'name', 'fullname', 'intern name'],
  email: ['email', 'email address', 'emailaddress', 'mail'],
  whatsapp: ['whatsapp', 'phone', 'phone number', 'phonenumber', 'mobile', 'whatsapp number'],
  gender: ['gender', 'sex'],
  university: ['university', 'university name', 'college', 'school', 'uni'],
  semester: ['semester', 'sem', 'current semester'],
  domain: ['domain', 'track', 'internship track', 'internship domain', 'select your domain'],
  skill_level: ['skill level', 'skill', 'skilllevel', 'experience level', 'your skill level in this domain'],
  available_hours: ['available hours per week', 'hours', 'availablehours', 'weekly hours', ' available hours per week'],
  referral_source: ['referral source', 'referral', 'source', 'how did you find us', 'how did you hear about us? ']
};

function getHeaderIndex(mappedKey) {
  const aliases = columnMappings[mappedKey];
  return headers.findIndex(h => {
    if (!h) return false;
    const cleanHeader = h.toLowerCase().trim().replace(/[\s\-_]/g, '');
    return aliases.some(alias => alias.toLowerCase().replace(/[\s\-_]/g, '') === cleanHeader);
  });
}

const keyIndexes = {};
for (const key of Object.keys(columnMappings)) {
  const index = getHeaderIndex(key);
  if (index !== -1) {
    keyIndexes[key] = index;
    console.log(`Mapped "${key}" -> Column "${headers[index]}"`);
  }
}

// Clean up rows
const cleanData = [];

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  if (row.length === 0 || row.every(val => val === null || val === undefined || val === '')) {
    continue;
  }

  // Scan all columns for the staircase layout registration number pattern
  let registrationNumber = '';
  for (let j = 0; j < row.length; j++) {
    const valStr = String(row[j] || '').trim();
    if (/CX-INT-2025-/i.test(valStr)) {
      registrationNumber = valStr;
      break;
    }
  }

  // Fallback scanner for any CX- prefix
  if (!registrationNumber) {
    for (let j = 0; j < row.length; j++) {
      const valStr = String(row[j] || '').trim();
      if (/CX-/i.test(valStr)) {
        registrationNumber = valStr;
        break;
      }
    }
  }

  const cleanRow = {
    registration_number: registrationNumber
  };

  for (const [key, index] of Object.entries(keyIndexes)) {
    const val = row[index];
    if (val !== undefined && val !== null && val !== '') {
      if (key === 'semester' || key === 'available_hours') {
        const numVal = parseInt(val, 10);
        cleanRow[key] = isNaN(numVal) ? null : numVal;
      } else {
        cleanRow[key] = String(val).trim();
      }
    } else {
      cleanRow[key] = null;
    }
  }

  // Map and sanitize domain strings to match database check constraint
  if (cleanRow.domain) {
    const d = cleanRow.domain.toLowerCase();
    if (d.includes('python')) cleanRow.domain = 'Python Programming';
    else if (d.includes('c++') || d.includes('cpp')) cleanRow.domain = 'C++ Programming';
    else if (d.includes('java')) cleanRow.domain = 'Java Programming';
    else if (d.includes('data science') || d.includes('ai')) cleanRow.domain = 'Data Science & AI Basics';
    else if (d.includes('cyber')) cleanRow.domain = 'Cybersecurity Fundamentals';
    else if (d.includes('full stack') || d.includes('web')) cleanRow.domain = 'Full Stack Development';
  }

  // Map and sanitize skill level
  if (cleanRow.skill_level) {
    const s = cleanRow.skill_level.toLowerCase();
    if (s.includes('begin')) cleanRow.skill_level = 'Beginner';
    else if (s.includes('intermed')) cleanRow.skill_level = 'Intermediate';
    else if (s.includes('advanc')) cleanRow.skill_level = 'Advanced';
  }

  // Skip rows with missing name/email
  if (cleanRow.full_name && cleanRow.email) {
    cleanData.push(cleanRow);
  }
}

console.log(`Parsed ${cleanData.length} valid rows.`);

// Generate clean CSV
const cleanHeaders = [
  'registration_number',
  'full_name',
  'email',
  'whatsapp',
  'gender',
  'university',
  'semester',
  'domain',
  'skill_level',
  'available_hours',
  'referral_source'
];

const csvRows = [cleanHeaders.join(',')];
for (const item of cleanData) {
  const rowValues = cleanHeaders.map(header => {
    const val = item[header];
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  });
  csvRows.push(rowValues.join(','));
}

fs.writeFileSync(outputFile, csvRows.join('\n'), 'utf8');
console.log(`\n\x1b[32mSuccess! Clean CSV file saved to:\x1b[0m\n${outputFile}`);
console.log(`\nYou can now import this clean CSV file directly into your Supabase table using the Supabase console.`);
