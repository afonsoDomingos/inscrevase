const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the correct place
const envPath = path.join(__dirname, 'server/.env');
dotenv.config({ path: envPath });

const Transaction = require('./server/src/models/Transaction');
const User = require('./server/src/models/User');
const Form = require('./server/src/models/Form');

async function auditTransactions() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGO_URI not found in " + envPath);

        const connectionUri = uri.replace('localhost', '127.0.0.1');
        await mongoose.connect(connectionUri);
        console.log('Connected to MongoDB');

        const topTransactions = await Transaction.find({
            $or: [
                { status: 'completed' },
                { paymentMethod: 'manual', status: 'pending' }
            ]
        })
        .sort({ baseAmount: -1, amount: -1 })
        .limit(10)
        .populate('user', 'name email')
        .populate('mentor', 'name businessName')
        .populate('form', 'title');

        console.log('\n--- TOP 10 TRANSACTIONS CONCERNING REVENUE ---');
        topTransactions.forEach((tx, i) => {
            console.log(`${i+1}. ID: ${tx._id}`);
            console.log(`   Type: ${tx.type}`);
            console.log(`   Amount: ${tx.amount} ${tx.currency}`);
            console.log(`   Base Amount (MZN): ${tx.baseAmount}`);
            console.log(`   Rate: ${tx.exchangeRate}`);
            console.log(`   User: ${tx.user?.name} (${tx.user?.email})`);
            console.log(`   Mentor: ${tx.mentor?.businessName || tx.mentor?.name}`);
            console.log(`   Form: ${tx.form?.title}`);
            console.log(`   Date: ${tx.createdAt}`);
            console.log('-----------------------------------');
        });

        const totalRevenue = topTransactions.reduce((acc, tx) => acc + (tx.baseAmount || tx.amount || 0), 0);
        console.log(`\nSubset Total (Top 10): ${totalRevenue.toLocaleString()} MT`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Audit Error:', err);
    }
}

auditTransactions();
