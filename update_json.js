const fs = require('fs');
const ptPath = 'client/src/messages/pt.json';
const enPath = 'client/src/messages/en.json';
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Delete the keys first to be sure they are clean
delete pt.events.typePhone;
delete pt.events.defaultFieldPhone;
delete en.events.typePhone;
delete en.events.defaultFieldPhone;

// Rectify pt.json
pt.events.typePhone = "Telemóvel / WhatsApp";
pt.events.defaultFieldPhone = "Telemóvel / WhatsApp";

// Ensure en.json is consistent
en.events.typePhone = "Phone / WhatsApp";
en.events.defaultFieldPhone = "Phone / WhatsApp";

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 4));
fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
console.log('defaultFieldPhone rectified again!');
