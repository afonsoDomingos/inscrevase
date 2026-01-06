const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const countUsers = async () => {
    try {
        const uri = process.env.MONGODB_URI.replace('localhost', '127.0.0.1');
        await mongoose.connect(uri);
        const count = await User.countDocuments();
        const roles = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log(`Total de usuários: ${count}`);
        console.log('--- Por Role ---');
        roles.forEach(r => {
            console.log(`${r._id}: ${r.count}`);
        });

        process.exit();
    } catch (err) {
        console.error('Erro ao contar usuários:', err);
        process.exit(1);
    }
};

countUsers();
