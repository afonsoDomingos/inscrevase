const mongoose = require('mongoose');
const exchangeRateService = require('../services/exchangeRateService');
const pushController = require('./pushController');
const whatsappService = require('../services/whatsappService');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const Submission = require('../models/Submission');
const NotificationService = require('../services/notificationService');
const AdRequest = require('../models/AdRequest');
const { PLANS } = require('../config/stripe');
const { getDynamicPlanConfig } = require('../utils/planConfigs');
const { getLatestRate } = require('../utils/currencyUtils');
const GlobalSettings = require('../models/GlobalSettings');
const sendEmail = require('../utils/emailService');
const {
    generatePaymentFailedEmail,
    generatePaymentRejectedEmail,
    generateAdminAdNotificationEmail,
    generateSubscriptionConfirmationEmail,
    generatePaymentProofReceivedEmail
} = require('../utils/emailTemplates');
const { logCommunication } = require('../utils/communicationLogger');


/**
 * STRIPE CONNECT - MENTOR ONBOARDING
 */

exports.createConnectAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail para configurar pagamentos.' });
        }

        // Check if user already has a Stripe account
        if (user.stripeAccountId) {
            return res.status(200).json({
                success: true,
                accountId: user.stripeAccountId,
                message: 'Account already exists'
            });
        }

        // Create Express account
        const account = await stripe.accounts.create({
            type: 'express',
            country: user.country || 'US', // Fallback to US if not set
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            metadata: { userId: user._id.toString() }
        });

        user.stripeAccountId = account.id;
        await user.save();

        res.status(200).json({
            success: true,
            accountId: account.id,
            message: 'Stripe account created successfully'
        });
    } catch (error) {
        console.error('--- STRIPE CREATE ACCOUNT ERROR ---');
        console.error('Code:', error.code);
        console.error('Type:', error.type);
        console.error('Message:', error.message);
        console.error('-----------------------------------');
        res.status(500).json({ message: error.message });
    }
};

exports.getOnboardingLink = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail para configurar pagamentos.' });
        }

        if (!user.stripeAccountId) {
            return res.status(400).json({ message: 'Stripe account not found. Create one first.' });
        }

        const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            refresh_url: `${process.env.CLIENT_URL}/dashboard/mentor?stripe=refresh`,
            return_url: `${process.env.CLIENT_URL}/dashboard/mentor?stripe=success`,
            type: 'account_onboarding',
        });

        res.status(200).json({ success: true, url: accountLink.url });
    } catch (error) {
        console.error('Onboarding Link Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAccountStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.stripeAccountId) {
            return res.status(200).json({ connected: false });
        }

        const account = await stripe.accounts.retrieve(user.stripeAccountId);

        const isComplete = account.details_submitted && account.charges_enabled;

        if (isComplete !== user.stripeOnboardingComplete) {
            user.stripeOnboardingComplete = isComplete;
            await user.save();
        }

        res.status(200).json({
            connected: true,
            accountId: account.id,
            onboardingComplete: isComplete,
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            email: account.email,
            country: account.country
        });
    } catch (error) {
        console.error('Account Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * CHECKOUT & PAYMENTS
 */

exports.createCheckoutSession = async (req, res) => {
    try {
        const { formId, submissionData, userCountry } = req.body;

        const form = await Form.findById(formId).populate('creator');
        if (!form || !form.slug) {
            return res.status(404).json({ message: 'Form not found or slug missing' });
        }

        if (!form.paymentConfig?.enabled || !form.paymentConfig?.price) {
            return res.status(400).json({ message: 'This event is not set up for payments' });
        }

        const mentor = form.creator;
        if (!mentor.isEmailVerified && mentor.role !== 'admin' && mentor.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'O mentor deste evento ainda não confirmou o e-mail.' });
        }

        // Check if mentor is ready for Stripe Connect
        const isMentorStripeReady = mentor.stripeAccountId && mentor.stripeOnboardingComplete;

        // Calculate application fee based on mentor plan
        const mentorPlan = mentor.plan || 'free';
        const dynamicPlans = await getDynamicPlanConfig();
        const planConfig = dynamicPlans[mentorPlan] || dynamicPlans.free || PLANS.free;
        const applicationFeeAmount = Math.round(form.paymentConfig.price * 100 * planConfig.commissionRate);

        const sessionData = {
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: form.paymentConfig.currency === 'MT' ? 'mzn' : form.paymentConfig.currency.toLowerCase(),
                    product_data: {
                        name: form.title,
                        description: `Registration for ${form.title}`,
                    },
                    unit_amount: Math.round(form.paymentConfig.price * 100),
                },
                quantity: 1,
            }],
            payment_intent_data: {
                metadata: {
                    formId: form._id.toString(),
                    mentorId: mentor._id.toString(),
                    payoutMode: isMentorStripeReady ? 'direct' : 'platform'
                }
            },
            metadata: {
                formId: form._id.toString(),
                submissionData: JSON.stringify(submissionData),
                payoutMode: isMentorStripeReady ? 'direct' : 'platform'
            },
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/f/${form.slug}?payment=cancel`,
        };

        // Only add transfer_data if mentor is ready
        if (isMentorStripeReady) {
            sessionData.payment_intent_data.application_fee_amount = applicationFeeAmount;
            sessionData.payment_intent_data.transfer_data = {
                destination: mentor.stripeAccountId,
            };
        }

        const session = await stripe.checkout.sessions.create(sessionData);

        res.status(200).json({ success: true, url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createAdCheckoutSession = async (req, res) => {
    try {
        const { adData } = req.body;
        const userId = req.user.id;

        // Duration weeks * base price ($5)
        const amount = Math.round(adData.durationWeeks * 5 * 100);

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Anúncio: ${adData.title}`,
                        description: `Publicidade Premium no Inscreva-se - ${adData.durationWeeks} semanas`,
                        images: adData.mediaType === 'image' ? [adData.mediaUrl] : [],
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            metadata: {
                type: 'ad_purchase',
                userId: userId,
                adData: JSON.stringify({
                    title: adData.title,
                    description: adData.description,
                    category: adData.category,
                    mediaUrl: adData.mediaUrl,
                    mediaType: adData.mediaType,
                    durationWeeks: adData.durationWeeks,
                    targetUrl: adData.targetUrl,
                    priceTotal: adData.priceTotal,
                    currency: adData.currency || 'USD',
                    paymentMethod: 'stripe'
                })
            },
            success_url: `${process.env.CLIENT_URL}/dashboard/mentor?ad_payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/anunciar?payment=cancel`,
        });

        res.status(200).json({ success: true, url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Ad Checkout Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const completeOrder = async (session) => {
    try {
        console.log('--- PROCESSING SUCCESSFUL ORDER ---');
        console.log('Session ID:', session.id);

        // 1. Expand payment intent to get more details
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent']
        });

        const paymentIntent = expandedSession.payment_intent;
        if (!paymentIntent) {
            console.error('No payment intent found in session');
            return null;
        }

        // 3. Extract metadata
        const metadata = expandedSession.metadata || {};
        console.log('📦 [completeOrder] Processing Order. Metadata Type:', metadata.type);
        console.log('📦 [completeOrder] Raw Metadata:', JSON.stringify(metadata));

        // 2. Check if transaction already exists to avoid duplicates
        const existingTx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (existingTx) {
            console.log('Order already processed for PaymentIntent:', paymentIntent.id);
            if (metadata && metadata.type === 'ad_purchase') {
                const ad = await AdRequest.findOne({ stripePaymentIntentId: paymentIntent.id });
                if (ad) {
                    console.log('✅ Found existing AdRequest, returning it.');
                    return ad;
                }
                console.log('⚠️ Transaction exists but AdRequest is missing. Proceeding to create AdRequest...');
            } else {
                return await Submission.findOne({ stripePaymentIntentId: paymentIntent.id });
            }
        }

        if (metadata.type === 'ad_purchase') {
            console.log('💎 [Stripe Webhook] Ad Purchase detected.');

            // Check if ad already created
            console.log('🔍 Checking for existing AdRequest with PI:', paymentIntent.id);
            let adRequest = await AdRequest.findOne({ stripePaymentIntentId: paymentIntent.id });

            if (!adRequest) {
                console.log('📝 Creating new AdRequest...');
                try {
                    const adData = JSON.parse(metadata.adData);
                    const userId = metadata.userId;

                    if (!userId) {
                        console.error('❌ FATAL: userId is missing in metadata!');
                        throw new Error('UserId missing in metadata');
                    }

                    console.log('👤 Advertiser User ID:', userId);
                    console.log('📊 Ad Data to Save:', JSON.stringify(adData));

                    adRequest = new AdRequest({
                        ...adData,
                        userId: new mongoose.Types.ObjectId(userId),
                        status: 'pending',
                        paymentStatus: 'paid',
                        stripePaymentIntentId: paymentIntent.id,
                        stripeSessionId: session.id,
                        priceTotal: expandedSession.amount_total / 100,
                        currency: expandedSession.currency.toUpperCase()
                    });

                    await adRequest.save();
                    console.log('✅ AdRequest saved successfully with ID:', adRequest._id);
                } catch (parseError) {
                    console.error('❌ Error parsing or saving AdRequest:', parseError);
                    throw parseError;
                }
            } else {
                console.log('ℹ️ AdRequest already exists, skipping creation.');
            }

            // 📧 Notify Super Admins
            try {
                console.log('📧 Notifying Admins about new Ad ID:', adRequest._id);
                const superAdmins = await User.find({ role: 'SuperAdmin' });
                const advertiser = await User.findById(userId);

                if (superAdmins.length > 0 && advertiser) {
                    const subject = `🚀 Novo Pagamento de Anúncio (Stripe): ${adRequest.title}`;
                    const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/admin`;

                    const emailHtml = generateAdminAdNotificationEmail(
                        advertiser.name,
                        advertiser.email,
                        adRequest.title,
                        adRequest.category,
                        adRequest.durationWeeks,
                        adRequest.priceTotal,
                        adRequest.currency,
                        'Stripe / Cartão',
                        dashboardUrl
                    );

                    for (const admin of superAdmins) {
                        if (admin.email) {
                            await sendEmail(admin.email, subject, emailHtml);
                        }

                        // Notificação In-App
                        await NotificationService.notify({
                            recipient: admin._id,
                            sender: userId,
                            title: 'Novo Anúncio (Pago)! 💎',
                            content: `${advertiser.name} pagou por um novo anúncio via Stripe: "${adRequest.title}".`,
                            type: 'system',
                            actionUrl: '/dashboard/admin/ads'
                        });

                        // --- REAL PUSH NOTIFICATION ---
                        pushController.sendNotification(
                            admin._id,
                            '💎 Novo Pagamento Ads!',
                            `${advertiser.name} pagou por um anúncio: "${adRequest.title}".`,
                            adRequest.mediaUrl || '/logo.png',
                            '/dashboard/admin/ads'
                        );

                        // --- WHATSAPP NOTIFICATION TO ADMINS ---
                        if (admin.phone) {
                            const adminName = admin.name ? admin.name.split(' ')[0] : 'Admin';
                            const baseUrl = process.env.FRONTEND_URL || 'https://inscreva-se.com';
                            const msg = `Olá *${adminName}*! 👋\n\n💎 *NOVO PAGAMENTO DE ANÚNCIO!*\nAcaba de entrar na plataforma um pagamento aprovado para a campanha "${adRequest.title}".\n\n👤 *Empresa/Utilizador:* ${advertiser.name}\n💰 *Valor Pago:* ${adRequest.priceTotal} ${adRequest.currency}\n\n🔗 *Aprovar Criativos:*\n${baseUrl}/dashboard/admin/ads`;
                            whatsappService.sendMessage(admin.phone, msg);
                        }
                    }
                }
            } catch (emailError) {
                console.error('⚠️ [Stripe Webhook] Error notifying super admins:', emailError);
            }

            // Create transaction for platform revenue (Admin view)
            console.log('💰 Logging transaction for Ad Purchase...');
            try {
                const rates = await exchangeRateService.getCurrentRates();
                const currentCurrency = expandedSession.currency.toUpperCase();
                const mznRate = rates['MZN'] || 63.8;
                const sourceCurrencyRate = rates[currentCurrency] || (currentCurrency === 'USD' ? 1 : 0.92);
                const rate = mznRate / sourceCurrencyRate;
                const amount = expandedSession.amount_total / 100;

                const transaction = new Transaction({
                    type: 'ad_purchase',
                    user: new mongoose.Types.ObjectId(metadata.userId),
                    amount: amount,
                    currency: expandedSession.currency.toUpperCase(),
                    baseAmount: amount * rate,
                    exchangeRate: rate,
                    platformFee: amount, // Full amount goes to platform
                    basePlatformFee: amount * rate,
                    status: 'completed',
                    paymentMethod: 'stripe',
                    stripePaymentIntentId: paymentIntent.id,
                    stripeSessionId: session.id,
                    metadata: { adRequestId: adRequest._id.toString() }
                });
                await transaction.save();
                console.log('✅ Transaction saved successfully for Ad:', adRequest._id);
            } catch (txError) {
                console.error('⚠️ [NON-FATAL] Error saving transaction for ad:', txError.message);
                // We don't throw here so the ad still "works" even if accounting fails
            }

            return adRequest;
        }

        const formId = metadata.formId;
        const submissionData = JSON.parse(metadata.submissionData);

        // 4. Create submission
        const submission = new Submission({
            form: formId,
            data: submissionData,
            paymentMethod: 'stripe',
            stripePaymentIntentId: paymentIntent.id,
            stripeSessionId: session.id,
            status: 'approved',
            paymentStatus: 'paid'
        });
        await submission.save();
        console.log('Submission created:', submission._id);

        // 5. Create transaction for mentor dashboard
        const rates = await exchangeRateService.getCurrentRates();
        const currentCurrency = expandedSession.currency.toUpperCase();
        const mznRate = rates['MZN'] || 63.8;
        const sourceCurrencyRate = rates[currentCurrency] || (currentCurrency === 'USD' ? 1 : 0.92);
        const rate = mznRate / sourceCurrencyRate;

        const amount = expandedSession.amount_total / 100;

        let platformFee = (paymentIntent.application_fee_amount || 0) / 100;
        let mentorEarnings = (expandedSession.amount_total - (paymentIntent.application_fee_amount || 0)) / 100;

        // If it was a platform payout, calculate the commission manually
        if (paymentIntent.metadata.payoutMode === 'platform') {
            try {
                const mentor = await User.findById(paymentIntent.metadata.mentorId);
                const mentorPlan = mentor?.plan || 'free';
                const dynamicPlans = await getDynamicPlanConfig();
                const planConfig = dynamicPlans[mentorPlan] || dynamicPlans.free || PLANS.free;

                platformFee = (expandedSession.amount_total / 100) * planConfig.commissionRate;
                mentorEarnings = (expandedSession.amount_total / 100) - platformFee;
            } catch (calcError) {
                console.error('Error calculating platform fee for platform payout:', calcError);
            }
        }

        const transaction = new Transaction({
            type: 'event_registration',
            user: paymentIntent.metadata.mentorId,
            mentor: paymentIntent.metadata.mentorId,
            form: formId,
            submission: submission._id,
            amount: amount,
            currency: expandedSession.currency.toUpperCase(),
            baseAmount: amount * rate,
            exchangeRate: rate,
            platformFee: platformFee,
            basePlatformFee: platformFee * rate,
            mentorEarnings: mentorEarnings,
            baseMentorEarnings: mentorEarnings * rate,
            status: 'completed',
            stripePaymentIntentId: paymentIntent.id,
            paymentMethod: 'stripe',
            metadata: {
                payoutMode: paymentIntent.metadata.payoutMode || 'direct'
            }
        });
        await transaction.save();
        console.log('Transaction logged for mentor:', transaction.mentor);

        // --- REAL PUSH NOTIFICATION (Shopify Style to Mentor) ---
        try {
            const mentor = await User.findById(paymentIntent.metadata.mentorId);
            const form = await Form.findById(formId);
            if (mentor && form) {
                pushController.sendNotification(
                    mentor._id,
                    "🎉 Vendeste um Bilhete!",
                    `Um novo participante acaba de pagar por "${form.title}".`,
                    form.coverImage || '/logo.png',
                    "/dashboard/mentor"
                );
            }
        } catch (pushErr) {
            console.error('Erro ao enviar push de venda de bilhete:', pushErr);
        }

        return submission;
    } catch (error) {
        console.error('FATAL ERROR IN COMPLETEORDER:', error);
        throw error;
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        console.log('Verifying payment for session:', sessionId);

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const result = await completeOrder(session);

        // Check if result is an AdRequest OR has fields that look like one
        const isAd = result && (result.constructor.modelName === 'AdRequest' || result.title);

        res.status(200).json({
            success: true,
            submission: !isAd ? result?._id : null,
            adId: isAd ? result?._id : null,
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase()
        });
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEarningsDashboard = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // 1. Fetch summary stats using aggregation
        const [summaryArr, dailyStats, recentTransactions] = await Promise.all([
            Transaction.aggregate([
                { $match: { mentor: new mongoose.Types.ObjectId(mentorId) } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$status", "completed"] },
                                            { $and: [{ $eq: ["$status", "pending"] }, { $eq: ["$paymentMethod", "manual"] }] }
                                        ]
                                    },
                                    "$baseAmount",
                                    0
                                ]
                            }
                        },
                        totalEarnings: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$status", "completed"] },
                                            { $and: [{ $eq: ["$status", "pending"] }, { $eq: ["$paymentMethod", "manual"] }] }
                                        ]
                                    },
                                    "$baseMentorEarnings",
                                    0
                                ]
                            }
                        },
                        totalFees: {
                            $sum: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ["$status", "completed"] },
                                            { $and: [{ $eq: ["$status", "pending"] }, { $eq: ["$paymentMethod", "manual"] }] }
                                        ]
                                    },
                                    "$basePlatformFee",
                                    0
                                ]
                            }
                        },
                        pendingFees: {
                            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$basePlatformFee", 0] }
                        }
                    }
                }
            ]),
            // 2. Fetch daily revenue for chart (last 30 days, grouped by date)
            Transaction.aggregate([
                {
                    $match: {
                        mentor: new mongoose.Types.ObjectId(mentorId),
                        $or: [
                            { status: "completed" },
                            { $and: [{ status: "pending" }, { paymentMethod: "manual" }] }
                        ],
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                        revenue: { $sum: "$baseAmount" },
                        fullDate: { $min: "$createdAt" }
                    }
                },
                { $sort: { fullDate: 1 } }
            ]),
            // 3. Last 10 transactions
            Transaction.find({
                mentor: mentorId,
                $or: [
                    { status: 'completed' },
                    { paymentMethod: 'manual', status: 'pending' }
                ]
            })
                .populate('form', 'title slug')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        ]);

        const summary = summaryArr.length > 0 ? summaryArr[0] : { totalRevenue: 0, totalEarnings: 0, totalFees: 0, pendingFees: 0 };
        delete summary._id; // Remove _id null

        // Prepare chart data (ensure last 14 days are present if missing)
        const chartMap = {};
        dailyStats.forEach(s => chartMap[s._id] = s.revenue);

        const finalChartData = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            finalChartData.push({
                date: dateStr,
                revenue: chartMap[dateStr] || 0
            });
        }

        res.status(200).json({
            success: true,
            summary,
            chartData: finalChartData,
            transactions: recentTransactions
        });
    } catch (error) {
        console.error('Earnings Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // req.body is a Buffer now because we used express.raw() in index.js
        console.log('📝 [Stripe Webhook] Verifying signature...');
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ [Stripe Webhook] Signature verified. Event type:', event.type);
    } catch (err) {
        console.error(`❌ [Stripe Webhook Error] Signature verification failed: ${err.message}`);
        console.error(`--- Headers: ${JSON.stringify(req.headers)}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    console.log('Stripe Webhook Event:', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        if (session.mode === 'subscription') {
            console.log('💎 [Stripe Webhook] Processing Subscription Session:', session.id);
            const userId = session.metadata.userId;
            const plan = session.metadata.plan;

            if (userId) {
                const user = await User.findById(userId);
                const updateData = {
                    plan: plan,
                    canCreateEvents: true,
                    stripeCustomerId: session.customer
                };

                // Soberania de papel: Só mudamos se for participante
                if (user && user.role === 'participant') {
                    updateData.role = 'mentor';
                }

                await User.findByIdAndUpdate(userId, updateData);
                console.log(`✅ [Stripe Webhook] User ${userId} (${user?.role}) upgraded to ${plan}`);

                // Enviar e-mail de confirmação
                if (user && user.email) {
                    const dynamicPlans = await getDynamicPlanConfig();
                    const planConfig = dynamicPlans[plan] || PLANS.pro;
                    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
                    const emailHtml = generateSubscriptionConfirmationEmail(user.name, plan, dashboardUrl, planConfig.commissionRate);
                    sendEmail(user.email, `Pagamento Confirmado: Bem-vindo ao plano ${plan.toUpperCase()}`, emailHtml);
                    await logCommunication({
                        recipientIds: [userId],
                        recipientEmails: [user.email],
                        subject: `💎 Pagamento Confirmado: Plano ${plan.toUpperCase()}`,
                        content: `Assinatura do plano ${plan} confirmada com sucesso via Stripe.`,
                        status: 'sent'
                    });
                }

                // Check if transaction already created by invoice.paid
                const existingTx = await Transaction.findOne({ stripeSessionId: session.id });
                if (!existingTx) {
                    const rates = await exchangeRateService.getCurrentRates();
                    const currentCurrency = session.currency.toUpperCase();
                    const mznRate = rates['MZN'] || 63.8;
                    const sourceCurrencyRate = rates[currentCurrency] || (currentCurrency === 'USD' ? 1 : 0.92);
                    const rate = mznRate / sourceCurrencyRate;
                    const amount = session.amount_total / 100;

                    const tx = new Transaction({
                        type: 'subscription',
                        subscriptionPlan: plan ? String(plan).toLowerCase() : 'pro',
                        user: userId,
                        amount: amount,
                        currency: session.currency.toUpperCase(),
                        baseAmount: amount * rate,
                        exchangeRate: rate,
                        platformFee: amount,
                        basePlatformFee: amount * rate,
                        status: 'completed',
                        stripeSessionId: session.id,
                        subscriptionId: session.subscription,
                        paymentMethod: 'stripe',
                        metadata: { plan }
                    });
                    await tx.save();
                    console.log('💰 [Stripe Webhook] Transaction created via Session');

                    // --- REAL PUSH NOTIFICATION TO ADMINS ---
                    try {
                        const superAdmins = await User.find({ role: 'SuperAdmin' });
                        for (const admin of superAdmins) {
                            pushController.sendNotification(
                                admin._id,
                                "🚀 Novo Assinante Premium!",
                                `${user ? user.name : 'Alguém'} fez upgrade para o plano ${plan.toUpperCase()}.`,
                                '/logo.png',
                                "/dashboard/admin"
                            );

                            // --- WHATSAPP NOTIFICATION TO ADMINS ---
                            if (admin.phone) {
                                const adminName = admin.name ? admin.name.split(' ')[0] : 'Admin';
                                const userEmail = user ? user.email : 'Sem email';
                                const userName = user ? user.name : 'Novo Utilizador';
                                const baseUrl = process.env.FRONTEND_URL || 'https://inscreva-se.com';
                                
                                const msg = `Olá *${adminName}*! 🚀\n\n💳 *NOVA ASSINATURA PREMIUM!*\nAlguém acabou de fazer upgrade à sua conta!\n\n👤 *Nome:* ${userName}\n📧 *Email:* ${userEmail}\n⭐ *Plano Activado:* ${plan.toUpperCase()}\n\n🔗 *Ver Painel:*\n${baseUrl}/dashboard/admin`;
                                whatsappService.sendMessage(admin.phone, msg);
                            }
                        }
                    } catch (pushErr) {
                        console.error('Erro ao enviar push de subscrição:', pushErr);
                    }
                }
            }
        } else {
            await completeOrder(session);
        }
    } else if (event.type === 'invoice.paid') {
        const invoice = event.data.object;
        // Only process if it's a subscription and has our metadata (might be in subscription metadata)
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const userId = subscription.metadata.userId;
            const plan = subscription.metadata.plan;

            if (userId) {
                const user = await User.findById(userId);
                const updateData = {
                    plan: plan,
                    canCreateEvents: true,
                    stripeCustomerId: invoice.customer
                };

                if (user && user.role === 'participant') {
                    updateData.role = 'mentor';
                }

                await User.findByIdAndUpdate(userId, updateData);

                // Enviar e-mail de confirmação
                if (user && user.email) {
                    const dynamicPlans = await getDynamicPlanConfig();
                    const planConfig = dynamicPlans[plan] || PLANS.pro;
                    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
                    const emailHtml = generateSubscriptionConfirmationEmail(user.name, plan, dashboardUrl, planConfig.commissionRate);
                    sendEmail(user.email, `Pagamento Confirmado: Bem-vindo ao plano ${plan.toUpperCase()}`, emailHtml);
                    await logCommunication({
                        recipientIds: [userId],
                        recipientEmails: [user.email],
                        subject: `💎 Pagamento Confirmado: Plano ${plan.toUpperCase()}`,
                        content: `Assinatura renovada/confirmada via fatura Stripe.`,
                        status: 'sent'
                    });
                }

                const existingTx = await Transaction.findOne({ subscriptionId: invoice.subscription, amount: invoice.amount_paid / 100 });
                if (!existingTx) {
                    const rates = await exchangeRateService.getCurrentRates();
                    const currentCurrency = invoice.currency.toUpperCase();
                    const mznRate = rates['MZN'] || 63.8;
                    const sourceCurrencyRate = rates[currentCurrency] || (currentCurrency === 'USD' ? 1 : 0.92);
                    const rate = mznRate / sourceCurrencyRate;
                    const amount = invoice.amount_paid / 100;

                    const tx = new Transaction({
                        type: 'subscription',
                        subscriptionPlan: plan ? String(plan).toLowerCase() : 'pro',
                        user: userId,
                        amount: amount,
                        currency: invoice.currency.toUpperCase(),
                        baseAmount: amount * rate,
                        exchangeRate: rate,
                        platformFee: amount,
                        basePlatformFee: amount * rate,
                        status: 'completed',
                        subscriptionId: invoice.subscription,
                        paymentMethod: 'stripe',
                        metadata: { plan, invoiceId: invoice.id }
                    });
                    await tx.save();
                    console.log('💰 [Stripe Webhook] Transaction created/verified via Invoice');
                }
            }
        }
    } else if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const userId = subscription.metadata.userId;
            const plan = subscription.metadata.plan || 'pro';

            if (userId) {
                const user = await User.findById(userId);
                if (user && user.email) {
                    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
                    const emailHtml = generatePaymentFailedEmail(user.name, plan, dashboardUrl);
                    sendEmail(user.email, `Problema com o Pagamento: Plano ${plan.toUpperCase()}`, emailHtml);
                    await logCommunication({
                        recipientIds: [userId],
                        recipientEmails: [user.email],
                        subject: `❌ Problema na Assinatura: Plano ${plan.toUpperCase()}`,
                        content: `Erro ao processar pagamento automático da assinatura.`,
                        status: 'sent'
                    });
                }
                console.log(`❌ [Stripe Webhook] Payment failed for user ${userId}`);
            }
        }
    } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
            user.plan = 'free';
            // Se for mentor, volta a ser participante. Se for Empresa/Especialista, mantém mas perde privilégios se necessário.
            if (user.role === 'mentor') {
                user.role = 'participant';
            }
            // canCreateEvents: false? Opcional dependendo da política
            await user.save();
            console.log(`User ${user._id} downgraded due to subscription cancellation. Role: ${user.role}`);
        }
    } else if (event.type === 'account.updated') {
        const account = event.data.object;
        const user = await User.findOne({ stripeAccountId: account.id });
        if (user) {
            user.stripeOnboardingComplete = account.details_submitted && account.charges_enabled;
            await user.save();
        }
    }

    res.json({ received: true });
};

exports.whoami = async (req, res) => {
    try {
        const account = await stripe.accounts.retrieve();
        res.status(200).json({
            success: true,
            account_id: account.id,
            business_name: account.settings?.dashboard?.display_name,
            email: account.email,
            charges_enabled: account.charges_enabled,
            details_submitted: account.details_submitted
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createPortalSession = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Search for customer by email if not stored
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                user.stripeCustomerId = customerId;
                await user.save();
            }
        }

        if (!customerId) {
            return res.status(400).json({ message: 'No active Stripe billing found for this account.' });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.CLIENT_URL}/dashboard/mentor`,
        });

        res.status(200).json({ success: true, url: portalSession.url });
    } catch (error) {
        console.error('Portal Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.refundPayment = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId).populate('form');

        if (!submission || !submission.stripePaymentIntentId) {
            return res.status(404).json({ message: 'Stripe transaction not found for this submission.' });
        }

        // Check permissions: Admin or the Mentor who owns the form
        if (req.user.role !== 'admin' && req.user.role !== 'SuperAdmin' && submission.form.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to refund this payment.' });
        }

        const refund = await stripe.refunds.create({
            payment_intent: submission.stripePaymentIntentId,
            // refund_application_fee: true, // Optional: if you want to lose your platform fee too
        });

        if (refund.status === 'succeeded' || refund.status === 'pending') {
            submission.status = 'rejected';
            submission.paymentStatus = 'refunded';
            await submission.save();

            // Update transaction
            await Transaction.findOneAndUpdate(
                { stripePaymentIntentId: submission.stripePaymentIntentId },
                { status: 'refunded' }
            );

            return res.status(200).json({ success: true, message: 'Reembolso processado com sucesso.' });
        }

        res.status(400).json({ message: 'Erro ao processar reembolso no Stripe.' });
    } catch (error) {
        console.error('Refund Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createSubscription = async (req, res) => {
    try {
        const { plan, currency = 'USD' } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail antes de assinar um plano.' });
        }

        const dynamicPlans = await getDynamicPlanConfig();
        const planConfig = dynamicPlans[plan];

        if (!planConfig || plan === 'free') {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Get price for selected currency
        let price = planConfig.prices[currency];

        // If price doesn't exist for currency, try to calculate from MZN or fallback
        if (!price) {
            const mznRate = await getLatestRate();
            if (currency === 'USD' && planConfig.prices.MZN) {
                // Calculate USD from MZN
                price = Math.round((planConfig.prices.MZN / 100) / mznRate * 100);
            } else {
                price = planConfig.prices['USD'] || 0;
            }
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: !user.stripeCustomerId ? user.email : undefined,
            customer: user.stripeCustomerId || undefined,
            line_items: [{
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: { name: `Inscreva-se ${planConfig.name} Plan` },
                    unit_amount: price,
                    recurring: { interval: planConfig.interval },
                },
                quantity: 1,
            }],
            subscription_data: {
                metadata: { userId: user._id.toString(), plan }
            },
            metadata: { userId: user._id.toString(), plan },
            success_url: `${process.env.CLIENT_URL}/assinatura/sucesso?plan=${plan}`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard/mentor?subscription=cancel`,
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        console.error('Subscription Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.syncSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // List subscriptions from Stripe for this user's email
        const subscriptions = await stripe.subscriptions.list({
            limit: 1,
            status: 'active',
            customer: user.stripeCustomerId, // Assuming you store this, or filter by email if not
        });

        // Fallback search by email if stripeCustomerId is missing/invalid
        let activeSub = null;
        if (subscriptions.data.length > 0) {
            activeSub = subscriptions.data[0];
        } else {
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });
            if (customers.data.length > 0) {
                const customerSubs = await stripe.subscriptions.list({
                    customer: customers.data[0].id,
                    status: 'active',
                    limit: 1
                });
                if (customerSubs.data.length > 0) activeSub = customerSubs.data[0];
            }
        }

        if (activeSub) {
            // Found valid subscription, force update role
            const planName = activeSub.metadata.plan || 'pro'; // Default to pro if metadata missing

            // Only update if not already correct
            if (user.plan !== planName || (user.role === 'participant')) {
                if (user.role === 'participant') {
                    user.role = 'mentor';
                }
                user.plan = planName;
                user.canCreateEvents = true;
                await user.save();
                console.log(`Manual sync: User ${user._id} (${user.role}) updated to ${planName} found in Stripe`);
            }

            // Ensure admin transaction exists regardless of whether user update was needed
            // This handles cases where webhook updated user but failed to create transaction,
            // or if previous sync failed halfway.
            const existingTx = await Transaction.findOne({ subscriptionId: activeSub.id });
            if (!existingTx) {
                const rates = await exchangeRateService.getCurrentRates();
                const activePrice = activeSub.items.data[0].price;
                const amount = activePrice.unit_amount / 100;
                const currentCurrency = activeSub.currency.toUpperCase();

                const mznRate = rates['MZN'] || 63.8;
                const sourceCurrencyRate = rates[currentCurrency] || (currentCurrency === 'USD' ? 1 : 0.92);
                const rate = mznRate / sourceCurrencyRate;

                const tx = new Transaction({
                    type: 'subscription',
                    user: user._id,
                    amount: amount,
                    currency: currency,
                    baseAmount: amount * rate,
                    exchangeRate: rate,
                    platformFee: amount, // For subscriptions, 100% is platform revenue
                    basePlatformFee: amount * rate,
                    status: 'completed',
                    subscriptionId: activeSub.id,
                    paymentMethod: 'stripe',
                    metadata: { plan: planName, sync: 'manual' }
                });
                await tx.save();
                console.log(`Manual sync: Transaction created for subscription ${activeSub.id}`);
            }

            return res.json({ success: true, role: 'mentor', plan: planName, status: 'synced' });
        }

        return res.json({ success: false, message: 'No active subscription found' });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * ADMIN FINANCIAL CONTROL
 */

exports.getAdminTransactions = async (req, res) => {
    try {
        const { status, paymentMethod } = req.query;
        const query = {};
        if (status) query.status = status;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const transactions = await Transaction.find(query)
            .populate('mentor', 'name email businessName')
            .populate('user', 'name email businessName')
            .populate('form', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.confirmTransactionPayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId).populate('user');

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status === 'completed') return res.status(400).json({ message: 'Transaction already completed' });

        transaction.status = 'completed';
        await transaction.save();

        // If it's a subscription, upgrade the user
        if (transaction.type === 'subscription') {
            const plan = transaction.subscriptionPlan || transaction.metadata.get('plan') || 'pro';
            const user = await User.findById(transaction.user._id);
            const updateData = {
                plan: plan.toLowerCase(),
                canCreateEvents: true
            };

            if (user && user.role === 'participant') {
                updateData.role = 'mentor';
            }

            await User.findByIdAndUpdate(transaction.user._id, updateData);
            console.log(`User ${transaction.user._id} manually upgraded to ${plan}. Final Role: ${updateData.role || user?.role}`);

            // Enviar e-mail de confirmação (Manual)
            if (user && user.email) {
                const dynamicPlans = await getDynamicPlanConfig();
                const planConfig = dynamicPlans[plan.toLowerCase()] || PLANS.pro;
                const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
                const emailHtml = generateSubscriptionConfirmationEmail(user.name, plan, dashboardUrl, planConfig.commissionRate);
                sendEmail(user.email, `Sua Assinatura foi Ativada: Plano ${plan.toUpperCase()}`, emailHtml);
            }
        }

        res.status(200).json({ success: true, message: 'Pagamento confirmado e plano atualizado.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.rejectTransactionPayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if (transaction.status === 'completed') return res.status(400).json({ message: 'Cannot reject a completed transaction' });

        transaction.status = 'rejected';
        await transaction.save();

        const user = await User.findById(transaction.user);
        const plan = transaction.metadata.get('plan') || 'pro';
        if (user && user.email) {
            const dashboardUrl = `${process.env.CLIENT_URL}/dashboard/mentor`;
            const emailHtml = generatePaymentRejectedEmail(user.name, plan, dashboardUrl);
            sendEmail(user.email, `Pagamento Rejeitado: Plano ${plan.toUpperCase()}`, emailHtml);
        }

        res.status(200).json({ success: true, message: 'Pagamento rejeitado.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // If completed registration, it's safer not to delete, but user asked for it. 
        // We'll allow it for admins.
        await Transaction.findByIdAndDelete(transactionId);

        res.status(200).json({ success: true, message: 'Transação eliminada com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitManualSubscription = async (req, res) => {
    try {
        console.log('--- START MANUAL SUBSCRIPTION SUBMISSION ---');
        const { plan, amount, proofUrl, currency = 'USD' } = req.body;
        const userId = req.user.id;

        console.log(`User ${userId} submitting manual proof for plan: ${plan}, amount: ${amount} ${currency}`);

        if (!plan || !amount || !proofUrl) {
            console.error('❌ Missing required fields:', { plan, amount, proofUrl });
            return res.status(400).json({ message: 'Todos os campos (plano, valor e comprovativo) são obrigatórios.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error('❌ Utilizador não encontrado:', userId);
            return res.status(404).json({ message: 'Utilizador não encontrado.' });
        }

        if (!user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin') {
            console.warn('⚠️ User email not verified:', user.email);
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail antes de assinar um plano.' });
        }

        const rate = currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;
        const numAmount = Number(amount);

        if (isNaN(numAmount)) {
            console.error('❌ Invalid amount:', amount);
            return res.status(400).json({ message: 'O valor do pagamento é inválido.' });
        }

        const transactionData = {
            type: 'subscription',
            subscriptionPlan: String(plan).toLowerCase(),
            user: userId,
            amount: numAmount,
            currency: currency.toUpperCase(),
            baseAmount: numAmount * rate,
            exchangeRate: rate,
            platformFee: numAmount,
            basePlatformFee: numAmount * rate,
            status: 'pending',
            paymentMethod: 'manual',
            proofUrl,
            metadata: new Map([['plan', String(plan)]])
        };

        const transaction = new Transaction(transactionData);
        await transaction.save();
        console.log('✅ Manual transaction saved:', transaction._id);

        // Enviar e-mail de recepção de comprovante (Safe Email Sending)
        try {
            if (user && user.email) {
                const planString = String(plan);
                const emailHtml = generatePaymentProofReceivedEmail(user.name, planString);
                // Não aguardamos o envio de e-mail para não atrasar a resposta ao utilizador,
                // mas capturamos erros dentro do bloco try-catch.
                sendEmail(user.email, `Recebemos seu comprovante: Plano ${planString.toUpperCase()}`, emailHtml)
                    .then(sent => console.log('📧 Confirmation email sent status:', sent))
                    .catch(e => console.error('E-mail error:', e));
            }
        } catch (emailErr) {
            console.error('⚠️ [NON-FATAL] Error generating confirmation email:', emailErr.message);
            // Non-fatal, we already saved the transaction
        }

        res.status(201).json({
            success: true,
            message: 'Solicitação de assinatura enviada com sucesso! A nossa equipa irá validar o comprovativo em breve.',
            transactionId: transaction._id
        });
    } catch (error) {
        console.error('❌ FATAL ERROR in submitManualSubscription:', error);
        res.status(500).json({ message: 'Erro interno ao processar a solicitação: ' + error.message });
    }
};

exports.getAdminFinancialSummary = async (req, res) => {
    try {
        const allTransactions = await Transaction.find().populate('mentor', 'name businessName');

        const summary = allTransactions.reduce((acc, tx) => {
            const isCompleted = tx.status === 'completed';
            const isManualPending = tx.status === 'pending' && tx.paymentMethod === 'manual';

            if (isCompleted || isManualPending) {
                const amount = tx.baseAmount || tx.amount;
                const platformFee = tx.basePlatformFee || tx.platformFee;

                acc.totalRevenue += amount;

                if (tx.type === 'subscription') {
                    acc.subscriptionRevenue += amount;
                    if (isCompleted) acc.collectedFees += amount;
                } else {
                    acc.eventFeeRevenue += platformFee;
                    if (isCompleted) acc.collectedFees += platformFee;
                }
            }

            if (tx.status === 'pending') {
                acc.pendingFees += tx.basePlatformFee || tx.platformFee;
            }
            return acc;
        }, { collectedFees: 0, pendingFees: 0, totalRevenue: 0, subscriptionRevenue: 0, eventFeeRevenue: 0 });

        // Growth Chart (Last 12 months)
        const currentYear = new Date().getFullYear();
        const monthlyStats = Array(12).fill(0).map((_, i) => ({
            month: i,
            platformFees: 0,
            revenue: 0
        }));

        allTransactions.forEach(tx => {
            const date = new Date(tx.createdAt);
            const isValid = tx.status === 'completed' || (tx.status === 'pending' && tx.paymentMethod === 'manual');

            if (date.getFullYear() === currentYear && isValid) {
                const month = date.getMonth();
                const amount = tx.baseAmount || tx.amount;
                const platformFee = tx.basePlatformFee || tx.platformFee;

                monthlyStats[month].revenue += amount;
                if (tx.type === 'subscription') {
                    monthlyStats[month].platformFees += amount;
                } else {
                    monthlyStats[month].platformFees += platformFee;
                }
            }
        });

        // Payment Method Breakdown
        const paymentMethods = allTransactions.reduce((acc, tx) => {
            if (tx.status === 'completed') {
                const method = tx.paymentMethod || 'manual';
                acc[method] = (acc[method] || 0) + 1;
            }
            return acc;
        }, {});

        // Top Mentors by Revenue (Platform Fee generated)
        const mentorRevenue = {};
        allTransactions.forEach(tx => {
            const isValid = tx.status === 'completed' || (tx.status === 'pending' && tx.paymentMethod === 'manual');
            if (isValid && tx.mentor) {
                const mentorId = tx.mentor._id.toString();
                const amount = tx.baseAmount || tx.amount;
                const platformFee = tx.basePlatformFee || tx.platformFee;

                if (!mentorRevenue[mentorId]) {
                    mentorRevenue[mentorId] = {
                        name: tx.mentor.name || 'Unknown',
                        business: tx.mentor.businessName || '',
                        totalGenerated: 0,
                        platformFees: 0
                    };
                }
                mentorRevenue[mentorId].totalGenerated += amount;
                mentorRevenue[mentorId].platformFees += platformFee;
            }
        });

        const topMentors = Object.values(mentorRevenue)
            .sort((a, b) => b.platformFees - a.platformFees)
            .slice(0, 5);

        const currentRate = await getLatestRate();

        res.status(200).json({
            success: true,
            summary,
            monthlyStats,
            paymentMethods,
            topMentors,
            currentRate
        });
    } catch (error) {
        console.error('Financial Summary Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * DYNAMIC PLANS & EXCHANGE RATE
 */
/**
 * getLatestRate was moved to ../utils/currencyUtils.js
 */

/**
 * getDynamicPlanConfig was moved to ../utils/planConfigs.js
 */

exports.getPlans = async (req, res) => {
    try {
        const mznRate = await getLatestRate();
        const basePlans = await getDynamicPlanConfig();

        // Clone and adjust based on current rate
        const dynamicPlans = JSON.parse(JSON.stringify(basePlans));

        // Ensure we always have updated USD prices based on the MZN base if it exists
        if (dynamicPlans.pro && dynamicPlans.pro.prices && dynamicPlans.pro.prices.MZN) {
            dynamicPlans.pro.prices.USD = Math.round((dynamicPlans.pro.prices.MZN / 100) / mznRate * 100);
        }

        if (dynamicPlans.enterprise && dynamicPlans.enterprise.prices && dynamicPlans.enterprise.prices.MZN) {
            dynamicPlans.enterprise.prices.USD = Math.round((dynamicPlans.enterprise.prices.MZN / 100) / mznRate * 100);
        }

        res.status(200).json({
            success: true,
            plans: dynamicPlans,
            rate: mznRate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePlans = async (req, res) => {
    try {
        const { plans } = req.body;
        if (!plans) return res.status(400).json({ message: 'Planos são necessários' });

        let settings = await GlobalSettings.findOne({ key: 'subscription_plans' });
        if (!settings) {
            settings = new GlobalSettings({
                key: 'subscription_plans',
                value: plans,
                lastUpdated: Date.now()
            });
        } else {
            settings.value = plans;
            settings.lastUpdated = Date.now();
        }

        await settings.save();
        res.status(200).json({ success: true, message: 'Configurações salvas com sucesso' });
    } catch (error) {
        console.error('Update plans error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMySubscriptionStatus = async (req, res) => {
    try {
        const pendingTx = await Transaction.findOne({
            user: req.user.id,
            type: 'subscription',
            status: 'pending',
            paymentMethod: 'manual'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            pending: !!pendingTx,
            plan: pendingTx ? pendingTx.metadata.get('plan') : null,
            date: pendingTx ? pendingTx.createdAt : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.refreshExchangeRate = async (req, res) => {
    try {
        console.log('[CURRENCY] Forçando atualização manual da taxa via Admin...');

        // Buscamos ignorando o cache/TTL
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');

        if (response.data && response.data.rates && response.data.rates.MZN) {
            const marketRate = response.data.rates.MZN;
            const safetyMargin = 0.015;
            const adjustedRate = marketRate * (1 - safetyMargin);
            const now = Date.now();

            let settings = await GlobalSettings.findOne({ key: 'exchange_rate_usd_mzn' });

            if (!settings) {
                settings = new GlobalSettings({
                    key: 'exchange_rate_usd_mzn',
                    value: adjustedRate,
                    lastUpdated: now
                });
            } else {
                settings.value = adjustedRate;
                settings.lastUpdated = now;
            }

            await settings.save();
            cachedExchangeRate = adjustedRate;
            lastRateFetch = now;

            return res.status(200).json({
                success: true,
                message: 'Taxa de câmbio atualizada com sucesso!',
                marketRate,
                adjustedRate,
                lastUpdated: settings.lastUpdated
            });
        }

        res.status(400).json({ success: false, message: 'Não foi possível obter dados da API de câmbio.' });
    } catch (error) {
        console.error('[CURRENCY] Erro ao forçar atualização:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

