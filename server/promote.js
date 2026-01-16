const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const promoteUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'SuperAdmin';
        await user.save();

        console.log(`User ${email} promoted to SuperAdmin successfully!`);
        process.exit();
    } catch (err) {
        console.error('Error promoting user:', err);
        process.exit(1);
    }
};

const email = process.argv[2] || 'admin@inscrevase.co.mz';
promoteUser(email);
