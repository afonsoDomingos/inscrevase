const dotenv = require('dotenv');
const path = require('path');

// Try all possible locations
const locations = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
    path.join(__dirname, 'server/.env'),
    path.join(__dirname, 'inscrevase/server/.env')
];

console.log('--- Environment Check ---');
locations.forEach(loc => {
    const result = dotenv.config({ path: loc });
    if (result.error) {
        console.log(`❌ Failed to load from: ${loc}`);
    } else {
        console.log(`✅ Loaded from: ${loc}`);
    }
});

console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
    console.log('Key length:', process.env.GEMINI_API_KEY.length);
    console.log('Key prefix:', process.env.GEMINI_API_KEY.substring(0, 5));
}
