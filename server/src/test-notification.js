require('dotenv').config();
const mongoose = require('mongoose');
const AdminAlertService = require('./services/adminAlertService');

async function testAdminNotification() {
    console.log('🚀 Iniciando teste de e-mail administrativo...');

    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Mongodb conectado.');

        console.log('📧 Enviando alerta de teste para inscrevase.events@gmail.com...');

        await AdminAlertService.notifyAdmins({
            title: 'TESTE DE SISTEMA: Notificação Admin Ativa ✅',
            content: `Olá! Este é um e-mail de teste automático da Inscreva-se para validar o novo endereço administrativo.<br><br><strong>Se estás a ler isto, a configuração foi um sucesso!</strong>`,
            actionUrl: '/dashboard/admin',
            type: 'system',
            notifyOwner: false // Evitar spam no WhatsApp durante o teste técnico
        });

        console.log('✨ Alerta enviado com sucesso. Por favor, verifica o teu e-mail (incluindo SPAM).');
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

testAdminNotification();
