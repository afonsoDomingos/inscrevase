const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const Transaction = require('../server/src/models/Transaction');

async function auditTransactions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
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

        const totalRevenue = topTransactions.reduce((acc, tx) => acc + (tx.baseAmount || tx.amount), 0);
        console.log(`\nSubset Total (Top 10): ${totalRevenue.toLocaleString()} MT`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Audit Error:', err);
    }
}

auditTransactions();
