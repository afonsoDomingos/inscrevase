const fs = require('fs');
const pt = JSON.parse(fs.readFileSync('src/messages/pt.json', 'utf8'));
const content = fs.readFileSync('src/components/admin/UsersList.tsx', 'utf8');

const regex = /t\(['"]([\w.]+)['"]/g;
let match;
const usedKeys = new Set();
while ((match = regex.exec(content)) !== null) {
  usedKeys.add(match[1]);
}

let hasError = false;
for (const k of usedKeys) {
  const parts = k.split('.');
  let val = pt;
  for (const p of parts) { 
    val = val?.[p]; 
  }
  if (typeof val === 'object' && val !== null) {
    console.log('CRASH IMMINENT: Key resolves to an OBJECT in PT:', k);
    hasError = true;
  }
}

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
for (const k of usedKeys) {
  const parts = k.split('.');
  let val = en;
  for (const p of parts) { 
    val = val?.[p]; 
  }
  if (typeof val === 'object' && val !== null) {
    console.log('CRASH IMMINENT: Key resolves to an OBJECT in EN:', k);
    hasError = true;
  }
}

if(!hasError) console.log('All keys return strings or are missing (no objects).');
