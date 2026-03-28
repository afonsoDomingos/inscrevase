/**
 * Script para sincronizar os preços e comissões dos planos na base de dados de produção.
 * Executa com: node fix-plan-price.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const GlobalSettings = require('./src/models/GlobalSettings');

// ✅ Valores correctos alinhados com BD de produção
const CORRECT_PLANS = {
    free: {
        name: 'Gratuito',
        commissionRate: 0.15,
        price: 0,
        currency: 'USD'
    },
    pro: {
        name: 'Profissional',
        commissionRate: 0.05, // 5%
        prices: {
            MZN: 125000, // 1.250 MT
            USD: 1959    // $19.59 USD
        },
        interval: 'month'
    },
    enterprise: {
        name: 'Enterprise',
        commissionRate: 0.00, // 0%
        prices: {
            MZN: 499900, // 4.999 MT
            USD: 7979    // $79.79 USD
        },
        interval: 'month'
    }
};

async function fixPlanPrices() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Ligado ao MongoDB');

    const doc = await GlobalSettings.findOne({ key: 'subscription_plans' });

    if (!doc) {
        // Cria o documento se não existir
        await GlobalSettings.create({ key: 'subscription_plans', value: CORRECT_PLANS });
        console.log('✅ Documento de planos criado na BD com os valores correctos.');
    } else {
        console.log('📦 Planos actuais na BD:', JSON.stringify(doc.value, null, 2));
        doc.value = CORRECT_PLANS;
        doc.markModified('value');
        await doc.save();
        console.log('✅ Planos actualizados na BD:');
        console.log('   • Pro: $19.59 USD / 1.250 MT / 5% comissão');
        console.log('   • Enterprise: $79.79 USD / 4.999 MT / 0% comissão');
        console.log('📦 Planos actualizados:', JSON.stringify(doc.value, null, 2));
    }

    await mongoose.disconnect();
    console.log('🔌 Desligado do MongoDB');
}

fixPlanPrices().catch(err => {
    console.error('❌ Erro:', err.message);
    process.exit(1);
});
