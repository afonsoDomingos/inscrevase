const GlobalSettings = require('../models/GlobalSettings');

/**
 * Get manual payment methods from global settings
 */
exports.getManualPaymentMethods = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne({ key: 'manual_payment_methods' });

        // Default methods if none exists in DB
        const defaultMethods = [
            {
                id: 'mz_mpesa',
                country: 'MZ',
                countryLabel: 'Moçambique',
                label: 'M-Pesa',
                icon: '🇲🇿',
                details: '856079576 (Afonso Domingos)',
                active: true
            },
            {
                id: 'mz_emola',
                country: 'MZ',
                countryLabel: 'Moçambique',
                label: 'e-Mola',
                icon: '🇲🇿',
                details: '879642412 (Afonso Domingos)',
                active: true
            },
            {
                id: 'mz_nib',
                country: 'MZ',
                countryLabel: 'Moçambique',
                label: 'NIB',
                icon: '🏦',
                details: '000100000074301049557',
                active: true
            },
            {
                id: 'paypal_manual',
                country: 'INT',
                countryLabel: 'Internacional',
                label: 'PayPal (Manual)',
                icon: '🌎',
                details: 'karinganastudio23@gmail.com',
                active: true
            }
        ];

        if (!settings) {
            return res.status(200).json(defaultMethods);
        }

        res.status(200).json(settings.value || defaultMethods);
    } catch (error) {
        console.error('[SETTINGS] Error fetching manual payment methods:', error.message);
        res.status(500).json({ message: 'Error fetching manual payment methods' });
    }
};

/**
 * Update manual payment methods (Admin only)
 */
exports.updateManualPaymentMethods = async (req, res) => {
    try {
        const { methods } = req.body;

        if (!Array.isArray(methods)) {
            return res.status(400).json({ message: 'Methods must be an array' });
        }

        const settings = await GlobalSettings.findOneAndUpdate(
            { key: 'manual_payment_methods' },
            {
                key: 'manual_payment_methods',
                value: methods,
                lastUpdated: Date.now()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('[SETTINGS] Error updating manual payment methods:', error.message);
        res.status(500).json({ message: 'Error updating manual payment methods' });
    }
};

/**
 * Get all global settings (Admin only)
 */
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await GlobalSettings.find();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
