const fs = require('fs');
const ptPath = 'client/src/messages/pt.json';
const enPath = 'client/src/messages/en.json';
const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

pt.common.months = {
    jan: "Jan",
    feb: "Fev",
    mar: "Mar",
    apr: "Abr",
    may: "Mai",
    jun: "Jun",
    jul: "Jul",
    aug: "Ago",
    sep: "Set",
    oct: "Out",
    nov: "Nov",
    dec: "Dez"
};

en.common.months = {
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec"
};

fs.writeFileSync(ptPath, JSON.stringify(pt, null, 4));
fs.writeFileSync(enPath, JSON.stringify(en, null, 4));
console.log('Common months added!');
