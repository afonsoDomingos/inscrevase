require('dotenv').config();
const sendEmail = require('../src/utils/emailService');
const { 
    generateSubscriptionExpiredEmail, 
    generateSubscriptionWarningEmail, 
    generateUpgradeSuggestionEmail 
} = require('../src/utils/emailTemplates');

const ADMIN_EMAIL = process.env.EMAIL_USER; // karinganastudio23@gmail.com
const DASHBOARD_URL = "https://inscreva-se.com/dashboard/plans";

async function runTests() {
    console.log(`🚀 Iniciando envio de emails de teste para: ${ADMIN_EMAIL}...`);

    try {
        // 1. Teste de Expiração
        console.log("➡️ Enviando Exemplo 1: Assinatura Expirada...");
        const expiredHtml = generateSubscriptionExpiredEmail("Admin Teste", "Pro", DASHBOARD_URL);
        await sendEmail(ADMIN_EMAIL, "🧪 TESTE: O seu plano PRO expirou", expiredHtml);

        // 2. Teste de Aviso (24h)
        console.log("➡️ Enviando Exemplo 2: Aviso de 24h...");
        const warningHtml = generateSubscriptionWarningEmail("Admin Teste", "Pro", 1, DASHBOARD_URL);
        await sendEmail(ADMIN_EMAIL, "🧪 TESTE: A sua assinatura expira em 24h", warningHtml);

        // 3. Teste de Sugestão de Upgrade
        console.log("➡️ Enviando Exemplo 3: Sugestão de Upgrade...");
        const upgradeHtml = generateUpgradeSuggestionEmail("Admin Teste", DASHBOARD_URL);
        await sendEmail(ADMIN_EMAIL, "🧪 TESTE: Leve os seus eventos ao próximo nível", upgradeHtml);

        console.log("\n✅ Todos os emails de teste foram enviados com sucesso!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Erro durante o envio de testes:", error);
        process.exit(1);
    }
}

runTests();
