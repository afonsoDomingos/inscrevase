const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const Submission = require('../models/Submission');
const { PLANS } = require('../config/stripe');
const GlobalSettings = require('../models/GlobalSettings');


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
        if (!mentor.stripeAccountId || !mentor.stripeOnboardingComplete) {
            return res.status(400).json({ message: 'Mentor is not ready to receive payments via Stripe' });
        }

        // Calculate application fee based on mentor plan
        const mentorPlan = mentor.plan || 'free';
        const planConfig = PLANS[mentorPlan] || PLANS.free;
        const applicationFeeAmount = Math.round(form.paymentConfig.price * 100 * planConfig.commissionRate);

        const session = await stripe.checkout.sessions.create({
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
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: mentor.stripeAccountId,
                },
                metadata: {
                    formId: form._id.toString(),
                    mentorId: mentor._id.toString(),
                }
            },
            metadata: {
                formId: form._id.toString(),
                submissionData: JSON.stringify(submissionData)
            },
            success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/f/${form.slug}?payment=cancel`,
        });

        res.status(200).json({ success: true, url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Checkout Error:', error);
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

        // 2. Check if transaction already exists to avoid duplicates
        const existingTx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id });
        if (existingTx) {
            console.log('Order already processed for PaymentIntent:', paymentIntent.id);
            const submission = await Submission.findOne({ stripePaymentIntentId: paymentIntent.id });
            return submission;
        }

        // 3. Extract metadata
        const metadata = expandedSession.metadata;
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
        const rate = expandedSession.currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;
        const amount = expandedSession.amount_total / 100;
        const platformFee = (paymentIntent.application_fee_amount || 0) / 100;
        const mentorEarnings = (expandedSession.amount_total - (paymentIntent.application_fee_amount || 0)) / 100;

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
            paymentMethod: 'stripe'
        });
        await transaction.save();
        console.log('Transaction logged for mentor:', transaction.mentor);

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

        const submission = await completeOrder(session);

        res.status(200).json({
            success: true,
            submission: submission?._id,
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
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] }
                        },
                        totalEarnings: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$mentorEarnings", 0] }
                        },
                        totalFees: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$platformFee", 0] }
                        },
                        pendingFees: {
                            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$platformFee", 0] }
                        }
                    }
                }
            ]),
            // 2. Fetch daily revenue for chart (last 30 days, grouped by date)
            Transaction.aggregate([
                {
                    $match: {
                        mentor: new mongoose.Types.ObjectId(mentorId),
                        status: "completed",
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                        revenue: { $sum: "$amount" },
                        fullDate: { $min: "$createdAt" }
                    }
                },
                { $sort: { fullDate: 1 } }
            ]),
            // 3. Last 10 transactions
            Transaction.find({ mentor: mentorId, status: 'completed' })
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

                // Check if transaction already created by invoice.paid
                const existingTx = await Transaction.findOne({ stripeSessionId: session.id });
                if (!existingTx) {
                    const rate = session.currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;
                    const amount = session.amount_total / 100;

                    const tx = new Transaction({
                        type: 'subscription',
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

                const existingTx = await Transaction.findOne({ subscriptionId: invoice.subscription, amount: invoice.amount_paid / 100 });
                if (!existingTx) {
                    const rate = invoice.currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;
                    const amount = invoice.amount_paid / 100;

                    const tx = new Transaction({
                        type: 'subscription',
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

        const planConfig = PLANS[plan];
        if (!planConfig || plan === 'free') {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const price = planConfig.prices[currency];

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
            success_url: `${process.env.CLIENT_URL}/dashboard/mentor?subscription=success&plan=${plan}`,
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
                const priceItem = activeSub.items.data[0].price;
                const amount = priceItem.unit_amount / 100;
                const currency = activeSub.currency.toUpperCase();
                const rate = currency === 'USD' ? await getLatestRate() : 1;

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
            const plan = transaction.metadata.get('plan') || 'pro';
            const user = await User.findById(transaction.user._id);
            const updateData = {
                plan: plan,
                canCreateEvents: true
            };

            if (user && user.role === 'participant') {
                updateData.role = 'mentor';
            }

            await User.findByIdAndUpdate(transaction.user._id, updateData);
            console.log(`User ${transaction.user._id} manually upgraded to ${plan}. Final Role: ${updateData.role || user?.role}`);
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
        const { plan, amount, proofUrl, currency = 'USD' } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.isEmailVerified && user.role !== 'admin' && user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Por favor, confirme seu e-mail antes de assinar um plano.' });
        }

        const rate = currency.toUpperCase() === 'USD' ? await getLatestRate() : 1;

        const transaction = new Transaction({
            type: 'subscription',
            user: userId,
            amount: Number(amount),
            currency: currency.toUpperCase(),
            baseAmount: Number(amount) * rate,
            exchangeRate: rate,
            platformFee: Number(amount),
            basePlatformFee: Number(amount) * rate,
            status: 'pending',
            paymentMethod: 'manual',
            proofUrl,
            metadata: { plan }
        });

        await transaction.save();
        res.status(201).json({ success: true, message: 'Solicitação de assinatura enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminFinancialSummary = async (req, res) => {
    try {
        const allTransactions = await Transaction.find().populate('mentor', 'name businessName');

        const summary = allTransactions.reduce((acc, tx) => {
            if (tx.status === 'completed') {
                const amount = tx.baseAmount || tx.amount; // Fallback for old transactions
                const platformFee = tx.basePlatformFee || tx.platformFee;

                acc.totalRevenue += amount;
                if (tx.type === 'subscription') {
                    acc.subscriptionRevenue += amount;
                    acc.collectedFees += amount;
                } else {
                    acc.eventFeeRevenue += platformFee;
                    acc.collectedFees += platformFee;
                }
            } else if (tx.status === 'pending') {
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
            if (date.getFullYear() === currentYear && tx.status === 'completed') {
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
            if (tx.status === 'completed' && tx.mentor) {
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
const axios = require('axios');
let cachedExchangeRate = 63.8; // Fallback rate
let lastRateFetch = 0;
const RATE_TTL = 1000 * 60 * 60 * 12; // 12 hours

const getLatestRate = async () => {
    try {
        // 1. Tentativo de buscar na base de dados (Persistência)
        let settings = await GlobalSettings.findOne({ key: 'exchange_rate_usd_mzn' });
        const now = Date.now();
        const RATE_TTL = 1000 * 60 * 60 * 24; // 24 horas para atualização diária

        // Se tivermos no DB e for recente, usamos
        if (settings && (now - new Date(settings.lastUpdated).getTime() < RATE_TTL)) {
            return settings.value;
        }

        // 2. Se não existir ou estiver expirado, busca na API
        console.log('[CURRENCY] A atualizar taxa de câmbio diária via API...');
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');

        if (response.data && response.data.rates && response.data.rates.MZN) {
            const marketRate = response.data.rates.MZN;

            // 3. Adicionar Margem de Segurança (Buffer de 1.5%)
            // Protege contra flutuações intra-diárias e taxas de conversão bancária
            const safetyMargin = 0.015;
            const adjustedRate = marketRate * (1 - safetyMargin);

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
            console.log(`[CURRENCY] Taxa atualizada: 1 USD = ${marketRate} MT (Ajustada para ${adjustedRate.toFixed(2)} MT com margem)`);
            return adjustedRate;
        }

        return settings ? settings.value : cachedExchangeRate;
    } catch (error) {
        console.error('[CURRENCY] Falha ao sincronizar taxa:', error.message);
        return cachedExchangeRate;
    }
};

exports.getPlans = async (req, res) => {
    try {
        const mznRate = await getLatestRate();
        const basePlans = require('../config/stripe').PLANS;

        // Clone and adjust based on current rate
        const dynamicPlans = JSON.parse(JSON.stringify(basePlans));

        // Let's assume MZN is the fixed base in Mozambique
        // Pro: 175 MT -> Calculate USD
        dynamicPlans.pro.prices.USD = Math.round((dynamicPlans.pro.prices.MZN / 100) / mznRate * 100);
        // Enterprise: 1750 MT -> Calculate USD
        dynamicPlans.enterprise.prices.USD = Math.round((dynamicPlans.enterprise.prices.MZN / 100) / mznRate * 100);

        res.status(200).json({
            success: true,
            plans: dynamicPlans,
            rate: mznRate,
            lastUpdate: lastRateFetch
        });
    } catch (error) {
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

