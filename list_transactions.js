
const mongoose = require('mongoose');
const Transaction = require('./server/src/models/Transaction');
require('dotenv').config({ path: './server/.env' });

async function checkTransactions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const transactions = await Transaction.find({}).sort({ createdAt: -1 });
        console.log('Total Transactions:', transactions.length);

        transactions.forEach(tx => {
            console.log(`ID: ${tx._id}`);
            console.log(`  User: ${tx.user}`);
            console.log(`  Type: ${tx.type}`);
            console.log(`  Amount: ${tx.amount}`);
            console.log(`  Status: ${tx.status}`);
            console.log(`  Metadata:`, tx.metadata);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkTransactions();
