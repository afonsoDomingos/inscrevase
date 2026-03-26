const fs = require('fs');
const tsx = fs.readFileSync('src/components/admin/UsersList.tsx', 'utf8');

const ptRegex = /t\(['"](.*?)['"]/g;
let match;
const keys = [];
while ((match = ptRegex.exec(tsx)) !== null) {
    keys.push(match[1]);
}

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

keys.forEach(k => {
    const parts = k.split('.');
    let val = en;
    for (const p of parts) {
        if(val) val = val[p];
    }
    if (val === undefined) {
        console.log('CRASH: Missing key in EN:', k);
    } 
});
console.log('Finished testing keys in EN.');
