const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function verifyAllUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { isEmailVerified: { $ne: true } },
            { $set: { isEmailVerified: true } }
        );

        console.log(`Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
}

verifyAllUsers();
