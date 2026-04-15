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
const whatsappService = require('../services/whatsappService');
const {
    generateSubscriptionConfirmationEmail,
    generateEventPaymentConfirmationEmail,
    generateTrialWelcomeEmail // Added for trial support
} = require('../utils/emailTemplates');
const GlobalSettings = require('../models/GlobalSettings');

/**
 * HELPER: Ensure PayPal Product and Plan exist
 */
async function ensurePaypalPlan(planKey, currency, trialDays = 0) {
    try {
        const settingsKey = `paypal_plan_${planKey}_${currency}_t${trialDays}`;
        const existingSetting = await GlobalSettings.findOne({ key: settingsKey });
        
        if (existingSetting && existingSetting.value) {
            return existingSetting.value;
        }

        // 1. Create Product if not exists
        const productKey = 'paypal_product_inscrevase';
        let productId;
        const prodSetting = await GlobalSettings.findOne({ key: productKey });
        
        if (prodSetting) {
            productId = prodSetting.value;
        } else {
            const product = await paypalService.createProduct({
                name: "Inscreva-se Pro",
                description: "Assinatura Pro - Plataforma Inscreva-se",
                type: "SERVICE",
                category: "SOFTWARE"
            });
            productId = product.id;
            await GlobalSettings.create({ key: productKey, value: productId });
        }

        // 2. Create Plan
        const dynamicPlans = await getDynamicPlanConfig();
        const planConfig = dynamicPlans[planKey] || dynamicPlans.pro || PLANS.pro;
        
        // Convert prices if needed (PayPal uses decimals)
        let amount = planConfig.prices?.[currency] ? (planConfig.prices[currency] / 100) : (planConfig.price || 0);
        if (currency === 'USD' && !amount) amount = 19.59; // Fallback

        const billingCycles = [];
        
        // Trial Cycle
        if (trialDays > 0) {
            billingCycles.push({
                frequency: { interval_unit: "DAY", interval_count: trialDays },
                tenure_type: "TRIAL",
                sequence: 1,
                total_cycles: 1,
                pricing_scheme: {
                    fixed_price: { value: "0", currency_code: currency }
                }
            });
        }

        // Regular Cycle
        billingCycles.push({
            frequency: { 
                interval_unit: planConfig.interval === 'year' ? "YEAR" : "MONTH", 
                interval_count: 1 
            },
            tenure_type: "REGULAR",
            sequence: trialDays > 0 ? 2 : 1,
            total_cycles: 0, // Infinite
            pricing_scheme: {
                fixed_price: { value: amount.toFixed(2), currency_code: currency }
            }
        });

        const plan = await paypalService.createPlan({
            product_id: productId,
            name: `${planConfig.name} - ${currency} ${trialDays > 0 ? `(${trialDays}d Trial)` : ''}`,
            status: "ACTIVE",
            billing_cycles: billingCycles,
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: "0", currency_code: currency },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            }
        });

        await GlobalSettings.create({ key: settingsKey, value: plan.id });
        return plan.id;
    } catch (error) {
        console.error('❌ Error in ensurePaypalPlan:', error);
        throw error;
    }
}

/**
 * CREATE ORDER FOR PLAN UPGRADE (SUBSCRIPTION) - LEGACY ONE-TIME
 */
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const { plan, currency, trial } = req.body;
        const userId = req.user.id;

        // If it's a trial, we MUST use recurring subscriptions
        if (trial) {
            return this.createRecurringSubscription(req, res);
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const dynamicPlans = await getDynamicPlanConfig();
        const planConfig = dynamicPlans[plan] || dynamicPlans.pro || PLANS.pro;

        let finalAmount;
        let finalCurrency = currency;

        if (currency === 'MZN' || currency === 'MT') {
            const mznPrice = planConfig.prices?.MZN ? (planConfig.prices.MZN / 100) : (planConfig.price || 0);
            const mznRate = await getLatestRate();
            finalAmount = mznPrice / mznRate;
            finalCurrency = 'USD';
        } else {
            finalAmount = planConfig.prices ? (planConfig.prices[currency] / 100) : (planConfig.price || 0);
            if (!finalAmount && planConfig.prices?.USD) {
                finalAmount = planConfig.prices.USD / 100;
                finalCurrency = 'USD';
            }
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
 * NEW: CREATE RECURRING SUBSCRIPTION (FOR TRIALS)
 */
exports.createRecurringSubscription = async (req, res) => {
    try {
        const { plan, currency, trial } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // PayPal doesn't support MZN for subscriptions, fallback to USD
        let finalCurrency = currency;
        if (currency === 'MZN' || currency === 'MT') {
            finalCurrency = 'USD';
        }

        const trialDays = (trial && !user.hasUsedTrial) ? 30 : 0;
        const planId = await ensurePaypalPlan(plan, finalCurrency, trialDays);

        const subscriptionData = {
            plan_id: planId,
            custom_id: JSON.stringify({ userId, plan, type: 'recurring_subscription', isTrial: trialDays > 0 }),
            application_context: {
                brand_name: "Inscreva-se",
                user_action: "SUBSCRIBE_NOW",
                return_url: `${process.env.CLIENT_URL}/dashboard/mentor?subscription=success`,
                cancel_url: `${process.env.CLIENT_URL}/planos`
            }
        };

        const subscription = await paypalService.createSubscription(subscriptionData);
        
        // Add a flag to tell the frontend it's a subscription, not an order
        res.status(200).json({ ...subscription, isRecurring: true });
    } catch (error) {
        console.error('❌ PayPal Create Recurring Subscription Error:', error);
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
        const selectedTierId = submissionData?.selectedTierId;
        
        // 🎫 Determine the price based on Tier or base price
        let totalAmountMZN = form.paymentConfig.price || 0;
        
        if (form.paymentConfig.useTieredPricing && selectedTierId && form.paymentConfig.pricingTiers?.length > 0) {
            const tier = form.paymentConfig.pricingTiers.find(t => t.id === selectedTierId);
            if (tier) {
                totalAmountMZN = tier.price;
                console.log(`🎫 Using Tiered Pricing: ${tier.category} - ${tier.price} MZN`);
            }
        }

        let finalAmount = 0;
        let inputCurrency = currency || 'MZN';
        
        // 🔄 Normalize currency (e.g., MT -> MZN)
        if (inputCurrency === 'MT') inputCurrency = 'MZN';
        let finalCurrency = inputCurrency;

        if (inputCurrency === 'MZN') {
            // Se for MZN, precisamos converter para USD para o PayPal processar
            const conversion = await exchangeRateService.convert(totalAmountMZN, 'MZN', 'USD');
            finalAmount = conversion.amount;
            finalCurrency = 'USD';
            console.log(`💱 PayPal Event: Converted ${totalAmountMZN} MZN to ${finalAmount} USD`);
        } else {
            // Se for outra moeda (EUR/USD), convertemos de MZN para essa moeda
            const conversion = await exchangeRateService.convert(totalAmountMZN, 'MZN', finalCurrency);
            finalAmount = conversion.amount;
        }

        // 🛡️ Safety check to prevent PayPal 400 (NaN)
        if (isNaN(finalAmount) || finalAmount <= 0) {
            console.error('❌ Error: Calculated amount is NaN or zero:', { totalAmountMZN, finalAmount, finalCurrency });
            return res.status(400).json({ 
                message: 'Erro no cálculo do valor de pagamento. Por favor, contacte o suporte.',
                debug: { totalAmountMZN, finalAmount, finalCurrency }
            });
        }

        // 🚀 Fix: Create the Submission in the database FIRST to avoid 127-char limit in custom_id
        const newSubmission = new Submission({
            form: formId,
            data: submissionData,
            paymentMethod: 'paypal',
            status: 'pending',
            paymentStatus: 'pending'
        });
        await newSubmission.save();

        const orderData = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: finalCurrency,
                    value: finalAmount.toFixed(2)
                },
                description: `Inscrição: ${form.title}`,
                // 🚀 Send money to mentor if they have paypalEmail configured
                ...(mentor.paypalEmail ? {
                    payee: {
                        email_address: mentor.paypalEmail.trim()
                    }
                } : {}),
                custom_id: JSON.stringify({
                    submissionId: newSubmission._id,
                    mentorId: mentor._id,
                    type: 'event_registration'
                })
            }]
        };

        console.log(`🚀 PayPal Creating Order: ${finalAmount.toFixed(2)} ${finalCurrency} for ${form.title}`);
        console.log(`📦 Order Body:`, JSON.stringify(orderData, null, 2));

        const order = await paypalService.createOrder(orderData);
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ PayPal Create Event Order Error:', error.response?.data || error.message);
        res.status(500).json({ 
            message: error.message,
            details: error.response?.data || "Erro interno na API do PayPal"
        });
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

        const amount = adData.priceTotal;
        const rawSourceCurrency = adData.currency || 'MZN';
        const sourceCurrency = rawSourceCurrency === 'MT' ? 'MZN' : rawSourceCurrency;

        let finalAmount;
        let requestedCurrency = currency || 'USD';
        if (requestedCurrency === 'MT') requestedCurrency = 'MZN';
        let finalCurrency = requestedCurrency;

        // Fix: Use the actual currency specified in the ad data instead of assuming MZN
        if (sourceCurrency === finalCurrency) {
            finalAmount = amount;
            console.log(`✅ PayPal Ad: Using direct amount ${finalAmount} ${finalCurrency} (No conversion needed)`);
        } else {
            const conversion = await exchangeRateService.convert(amount, sourceCurrency, finalCurrency);
            finalAmount = conversion.amount;
            console.log(`💱 PayPal Ad: Converted ${amount} ${sourceCurrency} to ${finalAmount} ${finalCurrency}`);
        }

        // 🛡️ Safety check to prevent PayPal 400 (NaN)
        if (isNaN(finalAmount) || finalAmount <= 0) {
            console.error('❌ Error: Calculated Ad amount is NaN or zero:', { amount, finalAmount, finalCurrency });
            return res.status(400).json({ 
                message: 'Erro no cálculo do valor do anúncio. Por favor, tente novamente.',
                debug: { amount, finalAmount, finalCurrency }
            });
        }

        // 🚀 Fix: Create the AdRequest in the database FIRST to avoid 127-char limit in custom_id
        const newAd = new AdRequest({
            ...adData,
            userId,
            paymentMethod: 'paypal',
            paymentStatus: 'pending',
            status: 'pending'
        });
        await newAd.save();

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
                    adId: newAd._id // Pass only the ID to keep custom_id short (< 127 chars)
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

        const currentCurrency = capture.amount.currency_code;
        const amount = parseFloat(capture.amount.value);
        const conversion = await exchangeRateService.convert(amount, currentCurrency, 'MZN');
        const baseAmount = conversion.amount;
        const rate = conversion.rate;

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
            const { submissionId, mentorId } = customData;

            // Update existing submission created during order step
            const submission = await Submission.findById(submissionId);
            if (!submission) {
                console.error('❌ Submission not found in database:', submissionId);
                throw new Error("Inscrição não encontrada para o ID: " + submissionId);
            }

            // Update status
            submission.status = 'approved';
            submission.paymentStatus = 'paid';
            submission.paypalOrderId = orderID;
            submission.paypalCaptureId = capture.id;
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
                const form = await Form.findById(submission.form);
                const submissionData = submission.data;
                const userEmail = submissionData instanceof Map ? (submissionData.get('Email') || submissionData.get('email') || submissionData.get('E-mail')) : (submissionData.Email || submissionData.email || submissionData['E-mail']);
                const userName = submissionData instanceof Map ? (submissionData.get('Nome') || submissionData.get('Name') || submissionData.get('name') || 'Participante') : (submissionData.Nome || submissionData.Name || submissionData.name || 'Participante');

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
            const { adId } = customData;

            // Find and Update existing Ad Request
            const ad = await AdRequest.findById(adId);
            if (!ad) {
                console.error('❌ Ad Request not found in database:', adId);
                throw new Error("Ad Request not found for ID: " + adId);
            }

            ad.paymentStatus = 'paid';
            ad.paypalOrderId = orderID;
            ad.paypalCaptureId = capture.id;
            await ad.save();

            // Create transaction record
            const amount = parseFloat(capture.amount.value);
            const tx = new Transaction({
                type: 'ad_payment',
                adId: ad._id,
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

            console.log('✅ Ad Payment Processed successfully via PayPal:', ad._id);
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
        const resource = event.resource;
        
        console.log('📩 PayPal Webhook Received:', event.event_type);

        switch (event.event_type) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED': {
                console.log('✅ Subscription Activated Event:', resource.id);
                
                const customId = resource.custom_id;
                if (!customId) break;

                const { userId, plan, isTrial } = JSON.parse(customId);
                const user = await User.findById(userId);
                
                if (user) {
                    const updateData = {
                        plan: plan,
                        subscriptionId: resource.id,
                        subscriptionStatus: isTrial ? 'trialing' : 'active',
                        canCreateEvents: true,
                        // Set expiration buffer (31 days)
                        planExpiresAt: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)
                    };

                    if (isTrial) {
                        updateData.trialStartedAt = new Date();
                        updateData.trialEndedAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        updateData.planExpiresAt = updateData.trialEndedAt;
                        updateData.hasUsedTrial = true;
                    }

                    if (user.role === 'participant') {
                        updateData.role = 'mentor';
                    }

                    await User.findByIdAndUpdate(userId, updateData);
                    console.log(`👤 User ${userId} upgraded to ${plan} via PayPal Subscription ${isTrial ? '(Trial)' : ''}`);

                    // --- WHATSAPP NOTIFICATION ---
                    if (user.whatsapp) {
                        const waMsg = isTrial 
                            ? `💎 *BEM-VINDO AO TESTE GRATUITO* - Inscreva-se\n\nOlá *${user.name.split(' ')[0]}*! O seu plano *${plan.toUpperCase()}* (30 dias grátis) já está ativo. 🎉\n\nJá podes criar eventos ilimitados e usar todas as ferramentas Pro!\n🔗 https://inscreva-se.com/dashboard/mentor`
                            : `✅ *ASSINATURA ATIVADA* - Inscreva-se\n\nOlá *${user.name.split(' ')[0]}*! O seu pagamento foi confirmado e o plano *${plan.toUpperCase()}* está ativo. 🎉\n\nBoas vendas! 📈`;
                        whatsappService.sendMessage(user.whatsapp, waMsg).catch(e => console.error('WA Error (PayPal Act):', e.message));
                    }

                    // 📧 Send Confirmation Email
                    try {
                        const dynamicPlans = await getDynamicPlanConfig();
                        const planConfig = dynamicPlans[plan] || PLANS.pro;
                        const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
                        
                        let emailHtml;
                        if (isTrial) {
                            emailHtml = generateTrialWelcomeEmail(user.name, plan, updateData.trialEndedAt, dashboardUrl);
                        } else {
                            emailHtml = generateSubscriptionConfirmationEmail(user.name, plan, dashboardUrl, planConfig.commissionRate);
                        }

                        await sendEmail(user.email, isTrial ? `Bem-vindo ao Teste Gratuito do Plano ${plan.toUpperCase()}` : `Pagamento Confirmado: Plano ${plan.toUpperCase()}`, emailHtml);
                    } catch (err) {
                        console.error('⚠️ Email error in PayPal webhook:', err);
                    }
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED': {
                console.log('💰 Subscription Payment Succeeded:', resource.id);
                // Extend planExpiresAt by another 31 days
                const subscribedUser = await User.findOne({ subscriptionId: resource.id });
                if (subscribedUser) {
                    subscribedUser.planExpiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
                    subscribedUser.subscriptionStatus = 'active';
                    await subscribedUser.save();
                    console.log(`✅ Extended planExpiresAt for user ${subscribedUser.email} due to successful payment.`);
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.EXPIRED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED': {
                console.log('❌ Subscription Stopped:', resource.id, event.event_type);
                const user = await User.findOne({ subscriptionId: resource.id });
                
                if (user && user.plan !== 'free') {
                    const oldPlan = user.plan;
                    user.plan = 'free';
                    user.subscriptionStatus = event.event_type.toLowerCase().split('.').pop(); // 'cancelled' or 'expired'
                    user.planExpiresAt = new Date();
                    user.lastExpirationEmailSentAt = new Date();
                    await user.save();

                    console.log(`👤 User ${user.email} reverted to FREE due to PayPal ${event.event_type}`);

                    // --- WHATSAPP NOTIFICATION ---
                    if (user.whatsapp) {
                        const waMsg = `⏳ *ASSINATURA TERMINADA* - Inscreva-se\n\nOlá *${user.name.split(' ')[0]}*! O seu plano *${oldPlan.toUpperCase()}* via PayPal foi interrompido e a sua conta voltou ao plano Free.\n\nPodes reativar a qualquer momento aqui:\n🔗 https://inscreva-se.com/planos`;
                        whatsappService.sendMessage(user.whatsapp, waMsg).catch(e => console.error('WA Error (PayPal Cancel):', e.message));
                    }

                    // 📧 Send Expiration Email
                    try {
                        const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/plans`;
                        const emailHtml = generateSubscriptionExpiredEmail(user.name, oldPlan, dashboardUrl);
                        await sendEmail(user.email, `Assinatura ${oldPlan.toUpperCase()} Terminada - Inscreva-se`, emailHtml);
                    } catch (err) {
                        console.error('⚠️ Email error in PayPal cancellation webhook:', err);
                    }
                }
                break;
            }

            case 'PAYMENT.CAPTURE.COMPLETED':
                console.log('💰 One-time Payment Captured Event');
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
