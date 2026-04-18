require('dotenv').config();
const { generateMonthlyFinancialReportEmail, generateFinancialHealthIncentiveEmail } = require('./src/utils/emailTemplates');
const sendEmail = require('./src/utils/emailService');

async function sendTestEmails() {
    console.log('🧪 Iniciando teste de layout de Emails Financeiros...');

    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) {
        console.error('❌ Erro: EMAIL_USER não definido no .env');
        return;
    }

    const adminName = 'Admin Inscreva-se';
    const dashboardUrl = 'https://inscreva-se.com/dashboard/mentor?tab=workspace';

    // 1. Teste Relatório Mensal
    const reportData = {
        totalIncome: 250500,
        totalExpense: 120200,
        balance: 130300,
        topCategories: [
            { name: 'Marketing Digital', value: 45000 },
            { name: 'Infraestrutura Cloud', value: 32000 },
            { name: 'Equipamentos', value: 21500 }
        ],
        insight: 'Parabéns pelos resultados! O seu ecossistema está saudável.'
    };

    try {
        console.log('📧 Enviando Relatório Mensal...');
        const reportHtml = generateMonthlyFinancialReportEmail(adminName, 'Abril 2024', reportData, dashboardUrl);
        await sendEmail(adminEmail, `📊 TESTE LAYOUT: Saúde Financeira (Relatório)`, reportHtml);
        
        console.log('📧 Enviando Incentivo de Uso...');
        const incentiveHtml = generateFinancialHealthIncentiveEmail(adminName, dashboardUrl);
        await sendEmail(adminEmail, `💎 TESTE LAYOUT: Incentivo Saúde Profissional`, incentiveHtml);

        console.log('✅ Todos os emails de teste foram enviados!');
    } catch (error) {
        console.error('🔴 Erro na execução do teste:', error);
    }
}

sendTestEmails();
