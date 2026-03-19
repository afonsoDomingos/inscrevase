const fs = require('fs');
const ptPath = 'client/src/messages/pt.json';
const enPath = 'client/src/messages/en.json';
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.dashboard.admin = {
    ...pt.dashboard.admin,
    todayPeakInsight: "Insight de Hoje",
    todayPeakMessage: "Hoje o momento de pico foi às {hour}h com {count} usuários.",
    patternPeakMessage: "Geralmente, o maior volume ocorre aos {day}.",
    peakNow: "Pico de Hoje"
};

en.dashboard.admin = {
    ...en.dashboard.admin,
    todayPeakInsight: "Today's Insight",
    todayPeakMessage: "Today's peak was at {hour}h with {count} users.",
    patternPeakMessage: "Typically, the highest volume occurs on {day}.",
    peakNow: "Today's Peak"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 4));
fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
console.log('Admin Insight keys added!');
