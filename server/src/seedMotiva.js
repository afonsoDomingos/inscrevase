const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MotivaContest = require('./models/MotivaContest');

const seedMotiva = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding Motiva...');

        // Clear existing contests if needed (Uncomment for full reset)
        // await MotivaContest.deleteMany({});

        const existingActive = await MotivaContest.findOne({ isActive: true });
        if (existingActive) {
            console.log('There is already an active MOTIVA phase. Seed aborted.');
            process.exit();
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days from now

        const initialPhase = new MotivaContest({
            phase: 1,
            rewardTitle: 'Prémio Fase Inicial',
            rewardValue: 'Assinatura Premium 1 Ano + 10.000 MT',
            startDate: new Date(),
            endDate: endDate,
            maxUploads: 10,
            isActive: true
        });

        await initialPhase.save();
        console.log('✅ Phase 1 of MOTIVA seeded successfully!');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding Motiva:', error);
        process.exit(1);
    }
};

seedMotiva();
