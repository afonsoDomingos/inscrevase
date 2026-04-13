const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

// Simulating the environment
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function sendTestEmail() {
    try {
        console.log('🔗 Conectando ao MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado.');

        const User = require('./src/models/User');
        const sendEmail = require('./src/utils/emailService');
        const { generateMotivaPhaseLaunchEmail } = require('./src/utils/emailTemplates');

        const admin = await User.findOne({ role: 'SuperAdmin' });
        if (!admin) {
            console.error('❌ Admin não encontrado.');
            process.exit(1);
        }

        const email = admin.email;
        console.log(`📧 Enviando teste PREMIUM para: ${email}`);

        const phase = 2;
        const rewardTitle = "iPhone 15 Pro Max + 1 Ano de Mentoria Elite";
        const rewardValue = "O vencedor terá acesso exclusivo a todas as aulas do Hub e o smartphone mais potente do mercado.";

        const emailHtml = generateMotivaPhaseLaunchEmail(phase, rewardTitle, rewardValue);
        
        const success = await sendEmail(email, `🔥 [PREMIUM] Nova Fase do Prémio MOTIVA Disponível!`, emailHtml);

        if (success) {
            console.log('✅ Email PREMIUM enviado com sucesso!');
        } else {
            console.log('❌ Falha ao enviar email.');
        }

    } catch (error) {
        console.error('💥 Erro:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}

sendTestEmail();
