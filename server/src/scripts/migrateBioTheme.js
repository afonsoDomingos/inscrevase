const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const SmartLink = require('../models/SmartLink');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Updating all bio links to theme: light...');
        const result = await SmartLink.updateMany(
            { type: 'bio' },
            { $set: { 'bioSettings.theme': 'light' } }
        );

        console.log(`Success! Updated ${result.modifiedCount} links.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
