const paypalService = require('../services/paypalService');
const exchangeRateService = require('../services/exchangeRateService');
const User = require('../models/User');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const AdRequest = require('../models/AdRequest');
const Submission = require('../models/Submission');
const { getDynamicPlanConfig } = require('../utils/planConfigs');
const { PLANS } = require('../config/stripe');
const { getLatestRate } = require('../utils/currencyUtils');
const sendEmail = require('../utils/emailService');
const {
    generateSubscriptionConfirmationEmail,
    generateEventPaymentConfirmationEmail
} = require('../utils/emailTemplates');

// Initializers removed (using paypalService)

/**
 * CREATE ORDER FOR PLAN UPGRADE (SUBSCRIPTION)
 */
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const { plan, currency } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const dynamicPlans = await getDynamicPlanConfig();
        const planConfig = dynamicPlans[plan] || dynamicPlans.pro || PLANS.pro;

        let finalAmount;
        let finalCurrency = currency;

        if (currency === 'MZN') {
            // Se o plano tiver preço fixo em USD (ex: 299 -> 2.99), usamos esse para evitar flutuação cambial no checkout
            if (planConfig.prices && planConfig.prices.USD) {
                finalAmount = planConfig.prices.USD / 100;
                finalCurrency = 'USD';
                console.log(`💱 PayPal Sub: Using fixed USD price for MZN selection: ${finalAmount} USD`);
            } else {
                // Caso contrário, convertemos o preço MZN para USD
                const mznPrice = planConfig.prices ? (planConfig.prices.MZN / 100) : (planConfig.price || 0);
                const conversion = await exchangeRateService.convert(mznPrice, 'MZN', 'USD');
                finalAmount = conversion.amount;
                finalCurrency = 'USD';
                console.log(`💱 PayPal Sub: Converted ${mznPrice} MZN to ${finalAmount} USD`);
            }
        } else {
            finalAmount = planConfig.prices ? (planConfig.prices[currency] / 100) : (planConfig.price || 0);
        }

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: finalCurrency,
                    value: finalAmount.toFixed(2)
                },
                description: `Upgrade para plano ${plan.toUpperCase()}`,
                custom_id: JSON.stringify({ userId, plan, type: 'subscription' })
            }]
        };

        const order = await paypalService.createOrder(orderData);
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ PayPal Create Subscription Order Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * CREATE ORDER FOR EVENT REGISTRATION
 */
exports.createEventOrder = async (req, res) => {
    try {
        const { formId, submissionData, currency } = req.body;

        const form = await Form.findById(formId).populate('creator');
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const mentor = form.creator;
        const totalAmountMZN = form.paymentConfig.price;

        let finalAmount;
        let finalCurrency = currency || 'USD';

        if (currency === 'MZN' || !currency) {
            // Se for MZN, precisamos converter para USD para o PayPal processar
            const conversion = await exchangeRateService.convert(totalAmountMZN, 'MZN', 'USD');
            finalAmount = conversion.amount;
            finalCurrency = 'USD';
            console.log(`💱 PayPal Event: Converted ${totalAmountMZN} MZN to ${finalAmount} USD`);
        } else {
            // Se for outra moeda (EUR/USD), usamos o valor direto (assumindo que o mentor definiu em USD/EUR ou que o sistema já converteu antes)
            // NOTA: No formulário atual, o preço é geralmente MZN.
            const conversion = await exchangeRateService.convert(totalAmountMZN, 'MZN', finalCurrency);
            finalAmount = conversion.amount;
        }

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: finalCurrency,
                    value: finalAmount.toFixed(2)
                },
                description: `Inscrição: ${form.title}`,
                custom_id: JSON.stringify({
                    formId,
                    submissionData,
                    mentorId: mentor._id,
                    type: 'event_registration'
                })
            }]
        };

        const order = await paypalService.createOrder(orderData);
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ PayPal Create Event Order Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * CREATE ORDER FOR AD CHECKOUT
 */
exports.createAdOrder = async (req, res) => {
    try {
        const { adData, currency } = req.body;
        const userId = req.user.id;

        if (!adData || !adData.priceTotal) {
            return res.status(400).json({ message: 'Dados do anúncio ou preço total ausentes' });
        }

        const totalAmountMZN = adData.priceTotal;

        let finalAmount;
        let finalCurrency = currency || 'USD';

        // Conversion logic (similar to events)
        if (currency === 'MZN' || !currency) {
            const conversion = await exchangeRateService.convert(totalAmountMZN, 'MZN', 'USD');
            finalAmount = conversion.amount;
            finalCurrency = 'USD';
            console.log(`💱 PayPal Ad: Converted ${totalAmountMZN} MZN to ${finalAmount} USD`);
        } else {
            const conversion = await exchangeRateService.convert(totalAmountMZN, 'MZN', finalCurrency);
            finalAmount = conversion.amount;
        }

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: finalCurrency,
                    value: finalAmount.toFixed(2)
                },
                description: `Pagamento de Anúncio: ${adData.title}`,
                custom_id: JSON.stringify({ 
                    userId, 
                    type: 'ad_checkout', 
                    adData: {
                        ...adData,
                        userId // Ensure userId is passed
                    }
                })
            }]
        };

        const order = await paypalService.createOrder(orderData);
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ PayPal Create Ad Order Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * CAPTURE ORDER
 */
exports.captureOrder = async (req, res) => {
    try {
        const { orderID } = req.body;
        console.log(`\n--- 💳 CAPTURING PAYPAL ORDER: ${orderID} ---`);

        const result = await paypalService.captureOrder(orderID);

        const purchaseUnit = result.purchase_units && result.purchase_units[0];
        if (!purchaseUnit) {
            console.error('❌ No purchase unit in result:', result);
            throw new Error("Invalid PayPal response: Missing purchase_units");
        }

        const capture = purchaseUnit.payments?.captures?.[0];
        if (!capture) {
            console.error('❌ No capture found in purchaseUnit:', purchaseUnit);
            throw new Error("Invalid PayPal response: Missing capture details");
        }

        // PayPal v2 might put custom_id in different places depending on the specific flow
        const rawCustomId = purchaseUnit.custom_id || result.custom_id || capture.custom_id;

        if (!rawCustomId) {
            console.error('❌ custom_id is missing in PayPal response. Result keys:', Object.keys(result));
            throw new Error("Missing custom_id in PayPal response");
        }

        // 🛡️ [ANTI-DUPLICATE] Check if this capture ID was already processed
        const existingTx = await Transaction.findOne({ paypalCaptureId: capture.id });
        if (existingTx) {
            console.log('ℹ️ PayPal Capture already processed:', capture.id);
            return res.status(200).json({
                success: true,
                message: 'Já processado',
                type: existingTx.type,
                plan: existingTx.subscriptionPlan
            });
        }

        let customData;
        try {
            customData = JSON.parse(rawCustomId);
        } catch (e) {
            console.error('❌ JSON Parse Error for custom_id:', rawCustomId);
            throw new Error(`"custom_id" is not valid JSON: ${rawCustomId}`);
        }

        console.log('✅ PayPal Payment Captured:', capture.id);
        console.log('📦 Parsed Custom Data:', customData);

        const rates = await exchangeRateService.getCurrentRates();
        const currentCurrency = capture.amount.currency_code;
        // Rate is (Target MZN) / (Source Currency Rate in USD terms)
        // Since rates are USD-based: 1 USD = rates['MZN'] MZN, 1 USD = rates[currentCurrency] CurrentCurrency
        // So 1 CurrentCurrency = rates['MZN'] / rates[currentCurrency] MZN
        const rate = (rates['MZN'] || 63.8) / (rates[currentCurrency] || (currentCurrency === 'USD' ? 1 : 0.92));

        if (customData.type === 'subscription') {
            const { userId, plan } = customData;
            const user = await User.findById(userId);

            const updateData = {
                plan: plan,
                canCreateEvents: true
            };

            if (user && user.role === 'participant') {
                updateData.role = 'mentor';
            }

            await User.findByIdAndUpdate(userId, updateData);

            const amount = parseFloat(capture.amount.value);
            const tx = new Transaction({
                type: 'subscription',
                subscriptionPlan: plan,
                user: userId,
                amount: amount,
                currency: capture.amount.currency_code,
                baseAmount: amount * rate,
                exchangeRate: rate,
                platformFee: amount, // Full amount goes to platform for subscriptions
                basePlatformFee: amount * rate,
                status: 'completed',
                paymentMethod: 'paypal',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id
            });
            await tx.save();

            // 📧 Send confirmation email (Subscription)
            if (user && user.email) {
                try {
                    const dynamicPlans = await getDynamicPlanConfig();
                    const planConfig = dynamicPlans[plan] || PLANS.pro;
                    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
                    const emailHtml = generateSubscriptionConfirmationEmail(user.name, plan, dashboardUrl, planConfig.commissionRate);
                    sendEmail(user.email, `Pagamento Confirmado: Bem-vindo ao plano ${plan.toUpperCase()}`, emailHtml)
                        .catch(e => console.error('E-mail error (PayPal Subscription):', e));
                } catch (emailErr) {
                    console.error('⚠️ [NON-FATAL] Error generating PayPal sub email:', emailErr.message);
                }
            }

            return res.status(200).json({ success: true, type: 'subscription', plan });
        }

        if (customData.type === 'event_registration') {
            const { formId, submissionData, mentorId } = customData;

            // Create submission
            const submission = new Submission({
                form: formId,
                data: submissionData,
                paymentMethod: 'paypal',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id,
                status: 'approved',
                paymentStatus: 'paid'
            });
            await submission.save();

            // Create transaction for mentor dashboard
            const amount = parseFloat(capture.amount.value);
            const fee = capture.seller_receivable_breakdown?.platform_fees?.[0]?.amount?.value || 0;
            const mentorEarnings = amount - parseFloat(fee);

            const transaction = new Transaction({
                type: 'event_registration',
                user: mentorId,
                mentor: mentorId,
                form: formId,
                submission: submission._id,
                amount: amount,
                currency: capture.amount.currency_code,
                baseAmount: amount * rate,
                exchangeRate: rate,
                platformFee: parseFloat(fee),
                basePlatformFee: parseFloat(fee) * rate,
                mentorEarnings: mentorEarnings,
                baseMentorEarnings: mentorEarnings * rate,
                status: 'completed',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id,
                paymentMethod: 'paypal'
            });
            await transaction.save();

            // 📧 Send confirmation email (Event Registration)
            try {
                const form = await Form.findById(formId);
                const userEmail = submissionData.Email || submissionData.email || submissionData['E-mail'];
                const userName = submissionData.Nome || submissionData.Name || submissionData.name || 'Participante';

                if (userEmail && form) {
                    const hubUrl = `${process.env.CLIENT_URL}/hub/${form.slug}`;
                    const emailHtml = generateEventPaymentConfirmationEmail(
                        userName,
                        form.title,
                        amount,
                        capture.amount.currency_code,
                        hubUrl
                    );
                    sendEmail(userEmail, `Inscrição Confirmada: ${form.title}`, emailHtml)
                        .catch(e => console.error('E-mail error (PayPal Event):', e));
                }
            } catch (emailErr) {
                console.error('⚠️ [NON-FATAL] Error sending PayPal event email:', emailErr.message);
            }

            return res.status(200).json({ success: true, type: 'event_registration', submissionId: submission._id });
        }

        if (customData.type === 'ad_checkout') {
            const { adData } = customData;

            // Create or Update Ad Request
            const newAd = new AdRequest({
                ...adData,
                paymentMethod: 'paypal',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id,
                paymentStatus: 'paid',
                status: 'pending' // Still needs admin approval
            });

            await newAd.save();

            // Create transaction record
            const amount = parseFloat(capture.amount.value);
            const tx = new Transaction({
                type: 'ad_payment',
                adId: newAd._id,
                user: customData.userId,
                amount: amount,
                currency: capture.amount.currency_code,
                baseAmount: amount * rate,
                exchangeRate: rate,
                platformFee: amount,
                basePlatformFee: amount * rate,
                status: 'completed',
                paymentMethod: 'paypal',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id
            });
            await tx.save();

            console.log('✅ Ad Payment Processed successfully via PayPal:', newAd._id);
            return res.status(200).json({ success: true, type: 'ad_checkout' });
        }

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('\n❌ PayPal Capture Order Error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.message,
            details: error.response?.data || "Axios/Service Error"
        });
    }
};

/**
 * PAYPAL WEBHOOK HANDLER
 */
exports.handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('📩 PayPal Webhook Received:', event.event_type);

        switch (event.event_type) {
            case 'PAYMENT.CAPTURE.COMPLETED':
                console.log('💰 Payment Captured Event');
                break;
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                console.log('✅ Subscription Activated Event');
                break;
            case 'BILLING.SUBSCRIPTION.CANCELLED':
                console.log('❌ Subscription Cancelled Event');
                break;
            default:
                console.log('ℹ️ Unhandled event type:', event.event_type);
        }

        res.status(200).send('Webhook Received');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * ADMIN: GET PAYPAL PAYOUTS (Transactions that need manual payout)
 */
exports.getPayPalPayouts = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            type: 'event_registration',
            status: 'completed',
            $or: [
                { paymentMethod: 'paypal' },
                {
                    paymentMethod: 'stripe',
                    'metadata.payoutMode': 'platform'
                }
            ]
        })
            .populate('user', 'name email businessName paypalEmail')
            .populate('mentor', 'name email businessName paypalEmail stripeAccountId')
            .populate({
                path: 'form',
                select: 'title slug'
            })
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        console.error('❌ PayPal Get Payouts Error:', error);
        res.status(500).json({ message: error.message });
    }
};
