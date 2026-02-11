const ExchangeRate = require('../models/ExchangeRate');
const axios = require('axios');

// API gratuita - 1500 requests/mês (não precisa de API key para plano básico)
const EXCHANGE_API_URL = 'https://open.exchangerate-api.com/v6/latest/USD';

// Fallback rates em caso de falha da API
const FALLBACK_RATES = {
    USD: 1,
    EUR: 0.92,
    MZN: 63.8,
    AOA: 850,
    CVE: 100,
    XOF: 600
};

class ExchangeRateService {
    /**
     * Busca taxas de câmbio da API externa
     */
    async fetchRatesFromAPI() {
        try {
            console.log('🔄 Fetching exchange rates from API...');
            const response = await axios.get(EXCHANGE_API_URL, {
                timeout: 10000 // 10 segundos de timeout
            });

            if (response.data && response.data.rates) {
                const rates = {
                    USD: 1,
                    EUR: response.data.rates.EUR || FALLBACK_RATES.EUR,
                    MZN: response.data.rates.MZN || FALLBACK_RATES.MZN,
                    AOA: response.data.rates.AOA || FALLBACK_RATES.AOA,
                    CVE: response.data.rates.CVE || FALLBACK_RATES.CVE,
                    XOF: response.data.rates.XOF || FALLBACK_RATES.XOF
                };

                console.log('✅ Exchange rates fetched successfully:', rates);
                return rates;
            }

            throw new Error('Invalid API response format');
        } catch (error) {
            console.error('❌ Error fetching exchange rates from API:', error.message);
            console.log('⚠️  Using fallback rates');
            return FALLBACK_RATES;
        }
    }

    /**
     * Atualiza ou cria registro de taxas no banco
     */
    async updateRates() {
        try {
            const rates = await this.fetchRatesFromAPI();

            // Busca ou cria o registro de taxas
            let exchangeRate = await ExchangeRate.findOne({});

            if (!exchangeRate) {
                exchangeRate = new ExchangeRate({
                    baseCurrency: 'USD',
                    rates: rates,
                    lastUpdated: new Date(),
                    nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h
                });
            } else {
                exchangeRate.rates = rates;
                exchangeRate.lastUpdated = new Date();
                exchangeRate.nextUpdate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            }

            await exchangeRate.save();
            console.log('💾 Exchange rates saved to database');
            return exchangeRate;
        } catch (error) {
            console.error('❌ Error updating exchange rates:', error);
            throw error;
        }
    }

    /**
     * Retorna as taxas atuais (do banco ou atualiza se necessário)
     */
    async getCurrentRates() {
        try {
            let exchangeRate = await ExchangeRate.findOne({});

            // Se não existe ou precisa atualizar
            if (!exchangeRate || exchangeRate.needsUpdate()) {
                console.log('🔄 Rates need update, fetching new rates...');
                exchangeRate = await this.updateRates();
            }

            return exchangeRate.rates;
        } catch (error) {
            console.error('❌ Error getting current rates:', error);
            // Em caso de erro, retorna taxas de fallback
            return FALLBACK_RATES;
        }
    }

    /**
     * Converte valor entre moedas
     */
    async convert(amount, fromCurrency, toCurrency) {
        try {
            const rates = await this.getCurrentRates();

            // Converte para USD primeiro, depois para moeda de destino
            const amountInUSD = amount / rates[fromCurrency];
            const convertedAmount = amountInUSD * rates[toCurrency];

            return {
                amount: convertedAmount,
                from: fromCurrency,
                to: toCurrency,
                rate: rates[toCurrency] / rates[fromCurrency],
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Error converting currency:', error);
            throw error;
        }
    }

    /**
     * Força atualização das taxas (útil para admin)
     */
    async forceUpdate() {
        console.log('🔄 Force updating exchange rates...');
        return await this.updateRates();
    }
}

module.exports = new ExchangeRateService();
