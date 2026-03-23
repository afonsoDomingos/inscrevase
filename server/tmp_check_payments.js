const mongoose = require('mongoose');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const PaymentAttempt = require('./src/models/PaymentAttempt');

async function check() {
    try {
        require('dotenv').config();
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- LATEST PAYMENT ATTEMPTS ---');
        const attempts = await PaymentAttempt.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email');
        attempts.forEach(a => {
            console.log(`[${a.createdAt.toISOString()}] User: ${a.userId?.name || 'Anon'} | Type: ${a.type} | Method: ${a.method} | Status: ${a.status}`);
        });

        console.log('\n--- LATEST TRANSACTIONS ---');
        const txs = await Transaction.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');
        txs.forEach(t => {
            console.log(`[${t.createdAt.toISOString()}] User: ${t.user?.name} | Type: ${t.type} | Status: ${t.status} | Method: ${t.paymentMethod} | ID: ${t.paypalOrderId || t.paypalCaptureId || '-'}`);
        });

        console.log('\n--- LATEST USERS UPDATED ---');
        const users = await User.find().sort({ updatedAt: -1 }).limit(3);
        users.forEach(u => {
            console.log(`[${u.updatedAt.toISOString()}] User: ${u.name} | Role: ${u.role} | Plan: ${u.plan}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
