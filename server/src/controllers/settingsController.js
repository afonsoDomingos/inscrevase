const GlobalSettings = require('../models/GlobalSettings');
const PaymentAttempt = require('../models/PaymentAttempt');

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
                details: '847877405 (Afonso Domingos)',
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
                details: 'inscrevase.events@gmail.com',
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

/**
 * Log a payment attempt
 */
exports.logPaymentAttempt = async (req, res) => {
    try {
        const { type, method, status, amount, currency, metadata } = req.body;
        const userId = req.user.id;

        const attempt = new PaymentAttempt({
            userId,
            type,
            method,
            status,
            amount,
            currency,
            metadata,
            ip: req.ip || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });

        await attempt.save();
        res.status(201).json({ success: true, id: attempt._id });
    } catch (error) {
        console.error('[PAYMENT_LOG] Error logging attempt:', error.message);
        res.status(500).json({ message: 'Error logging payment attempt' });
    }
};

/**
 * Get all payment attempts (Admin only)
 */
exports.getPaymentAttempts = async (req, res) => {
    try {
        const attempts = await PaymentAttempt.find()
            .populate('userId', 'name email businessName')
            .sort({ createdAt: -1 })
            .limit(200);
        
        res.status(200).json(attempts);
    } catch (error) {
        console.error('[PAYMENT_LOG] Error fetching attempts:', error.message);
        res.status(500).json({ message: 'Error fetching payment attempts' });
    }
};
/**
 * Get the global Meta Pixel ID
 */
exports.getGlobalPixel = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne({ key: 'global_meta_pixel_id' });
        res.status(200).json({ pixelId: settings ? settings.value : '1624084229040413' }); // Fallback to current production ID
    } catch (error) {
        console.error('[SETTINGS] Error fetching global pixel:', error.message);
        res.status(500).json({ message: 'Error fetching global pixel' });
    }
};

/**
 * Update the global Meta Pixel ID (Admin only)
 */
exports.updateGlobalPixel = async (req, res) => {
    try {
        const { pixelId } = req.body;

        if (!pixelId) {
            return res.status(400).json({ message: 'Pixel ID is required' });
        }

        const settings = await GlobalSettings.findOneAndUpdate(
            { key: 'global_meta_pixel_id' },
            {
                key: 'global_meta_pixel_id',
                value: pixelId,
                lastUpdated: Date.now()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Global Pixel updated successfully', settings });
    } catch (error) {
        console.error('[SETTINGS] Error updating global pixel:', error.message);
        res.status(500).json({ message: 'Error updating global pixel' });
    }
};

/**
 * Get the support WhatsApp number
 */
exports.getSupportWhatsapp = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne({ key: 'support_whatsapp' });
        // Fallback to new provided number 258847877405
        res.status(200).json({ number: settings ? settings.value : '258847877405' });
    } catch (error) {
        console.error('[SETTINGS] Error fetching support whatsapp:', error.message);
        res.status(500).json({ message: 'Error fetching support whatsapp' });
    }
};

/**
 * Update the support WhatsApp number (Admin only)
 */
exports.updateSupportWhatsapp = async (req, res) => {
    try {
        const { number } = req.body;

        if (!number) {
            return res.status(400).json({ message: 'WhatsApp number is required' });
        }

        // Clean number (remove spaces, +, etc)
        const cleanNumber = number.replace(/\D/g, '');

        const settings = await GlobalSettings.findOneAndUpdate(
            { key: 'support_whatsapp' },
            {
                key: 'support_whatsapp',
                value: cleanNumber,
                lastUpdated: Date.now()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Support WhatsApp updated successfully', settings });
    } catch (error) {
        console.error('[SETTINGS] Error updating support whatsapp:', error.message);
        res.status(500).json({ message: 'Error updating support whatsapp' });
    }
};
