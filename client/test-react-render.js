const fs = require('fs');
const tsx = fs.readFileSync('src/components/admin/UsersList.tsx', 'utf8');

const tRegex = /t\(['"](.*?)['"](?:,\s*\{.*?\})?\)/g;
let match;
const keys = [];
while ((match = tRegex.exec(tsx)) !== null) {
    keys.push(match[1]);
}

const pt = JSON.parse(fs.readFileSync('src/messages/pt.json', 'utf8'));

keys.forEach(k => {
    const parts = k.split('.');
    let val = pt;
    for (const p of parts) {
        if(val) val = val[p];
    }
    if (typeof val === 'object' && val !== null) {
        console.log('CRASH: Trying to render an object for key:', k);
    } else if (val === undefined) {
        console.log('Warning: Missing key in pt.json:', k);
    }
});
