require('dotenv').config();
const sendEmail = require('./utils/emailService');
const { generateBasicEmail } = require('./utils/emailTemplates');

async function testEmailOnly() {
    const adminEmail = process.env.ADMIN_EMAIL || 'inscrevase.events@gmail.com';
    console.log('🚀 Testando envio de e-mail direto para:', adminEmail);

    try {
        const emailHtml = generateBasicEmail(
            'TESTE DIRETO: Configuração de E-mail ✅',
            'Admin',
            'Este é um teste simplificado para confirmar que o servidor consegue enviar e-mails para o novo endereço configurado.',
            'Ver Painel',
            'https://inscreva-se.com/dashboard/admin'
        );

        await sendEmail(adminEmail, '🔔 Teste de Notificação Admin', emailHtml);
        console.log('✅ E-mail enviado com sucesso para:', adminEmail);
    } catch (error) {
        console.error('❌ Erro no envio:', error);
    }
}

testEmailOnly();
