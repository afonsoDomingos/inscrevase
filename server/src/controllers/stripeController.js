const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const Submission = require('../models/Submission');
const { PLANS } = require('../config/stripe');

/**
 * STRIPE CONNECT - MENTOR ONBOARDING
 */

exports.createConnectAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

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
        if (!user || !user.stripeAccountId) {
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
        const transaction = new Transaction({
            type: 'event_registration',
            user: paymentIntent.metadata.mentorId, // Required field in schema
            mentor: paymentIntent.metadata.mentorId,
            form: formId,
            submission: submission._id,
            amount: expandedSession.amount_total / 100,
            currency: expandedSession.currency.toUpperCase(),
            platformFee: (paymentIntent.application_fee_amount || 0) / 100,
            mentorEarnings: (expandedSession.amount_total - (paymentIntent.application_fee_amount || 0)) / 100,
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
        const transactions = await Transaction.find({
            mentor: mentorId
        }).populate('form', 'title slug').sort({ createdAt: -1 });

        // Simple aggregation
        const summary = transactions.reduce((acc, tx) => {
            if (tx.status === 'completed') {
                acc.totalRevenue += tx.amount;
                acc.totalEarnings += tx.mentorEarnings;
                acc.totalFees += tx.platformFee;
            } else if (tx.status === 'pending') {
                acc.pendingFees += tx.platformFee;
            }
            return acc;
        }, { totalRevenue: 0, totalEarnings: 0, totalFees: 0, pendingFees: 0 });

        // Calculate chart data (last 14 days for cleaner view, with 30 day history)
        const dailyRevenue = {};

        // Pre-initialize last 14 days with 0
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            dailyRevenue[dateStr] = 0;
        }

        transactions.forEach(tx => {
            if (tx.status === 'completed') {
                const date = new Date(tx.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                // Only add if within our display window or just allow dynamic growth
                dailyRevenue[date] = (dailyRevenue[date] || 0) + tx.amount;
            }
        });

        const chartData = Object.keys(dailyRevenue)
            .sort((a, b) => {
                const [dayA, monthA] = a.split('/').map(Number);
                const [dayB, monthB] = b.split('/').map(Number);
                return monthA !== monthB ? monthA - monthB : dayA - dayB;
            })
            .map(date => ({
                date,
                revenue: dailyRevenue[date]
            }));

        res.status(200).json({
            success: true,
            summary,
            chartData,
            transactions: transactions.filter(t => t.status === 'completed').slice(0, 10)
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
            // Plan Upgrade
            const userId = session.metadata.userId;
            const plan = session.metadata.plan;

            await User.findByIdAndUpdate(userId, {
                plan: plan,
                role: 'mentor',
                canCreateEvents: true,
                stripeCustomerId: session.customer
            });

            const tx = new Transaction({
                type: 'subscription',
                user: userId,
                amount: session.amount_total / 100,
                currency: session.currency.toUpperCase(),
                platformFee: session.amount_total / 100,
                status: 'completed',
                stripeSessionId: session.id,
                subscriptionId: session.subscription,
                paymentMethod: 'stripe',
                metadata: { plan }
            });
            await tx.save();
        } else {
            await completeOrder(session);
        }
    } else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
            user.plan = 'free';
            user.role = 'participant'; // Or keep as mentor but restricted
            await user.save();
            console.log(`User ${user._id} downgraded due to subscription cancellation`);
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
        const { plan, currency = 'MZN' } = req.body;
        const user = await User.findById(req.user.id);

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
            if (user.role !== 'mentor' || user.plan !== planName) {
                user.role = 'mentor';
                user.plan = planName;
                user.canCreateEvents = true;
                await user.save();
                console.log(`Manual sync: User ${user._id} upgraded to ${planName} found in Stripe`);
            }

            // Ensure admin transaction exists regardless of whether user update was needed
            // This handles cases where webhook updated user but failed to create transaction,
            // or if previous sync failed halfway.
            const existingTx = await Transaction.findOne({ subscriptionId: activeSub.id });
            if (!existingTx) {
                const priceItem = activeSub.items.data[0].price;
                const amount = priceItem.unit_amount / 100;

                const tx = new Transaction({
                    type: 'subscription',
                    user: user._id,
                    amount: amount,
                    currency: activeSub.currency.toUpperCase(),
                    platformFee: amount, // For subscriptions, 100% is platform revenue
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
            await User.findByIdAndUpdate(transaction.user._id, {
                plan: plan,
                role: 'mentor',
                canCreateEvents: true
            });
            console.log(`User ${transaction.user._id} manually upgraded to ${plan}`);
        }

        res.status(200).json({ success: true, message: 'Pagamento confirmado e plano atualizado.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.submitManualSubscription = async (req, res) => {
    try {
        const { plan, amount, proofUrl, currency = 'MT' } = req.body;
        const userId = req.user.id;

        const transaction = new Transaction({
            type: 'subscription',
            user: userId,
            amount: Number(amount),
            currency,
            platformFee: Number(amount),
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
                acc.totalRevenue += tx.amount;
                if (tx.type === 'subscription') {
                    acc.subscriptionRevenue += tx.amount;
                    acc.collectedFees += tx.amount; // Subscriptions are pure fee
                } else {
                    acc.eventFeeRevenue += tx.platformFee;
                    acc.collectedFees += tx.platformFee;
                }
            } else if (tx.status === 'pending') {
                acc.pendingFees += tx.platformFee;
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
                monthlyStats[month].revenue += tx.amount;
                if (tx.type === 'subscription') {
                    monthlyStats[month].platformFees += tx.amount;
                } else {
                    monthlyStats[month].platformFees += tx.platformFee;
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
                if (!mentorRevenue[mentorId]) {
                    mentorRevenue[mentorId] = {
                        name: tx.mentor.name || 'Unknown',
                        business: tx.mentor.businessName || '',
                        totalGenerated: 0,
                        platformFees: 0
                    };
                }
                mentorRevenue[mentorId].totalGenerated += tx.amount;
                mentorRevenue[mentorId].platformFees += tx.platformFee;
            }
        });

        const topMentors = Object.values(mentorRevenue)
            .sort((a, b) => b.platformFees - a.platformFees)
            .slice(0, 5);

        res.status(200).json({
            success: true,
            summary,
            monthlyStats,
            paymentMethods,
            topMentors
        });
    } catch (error) {
        console.error('Financial Summary Error:', error);
        res.status(500).json({ message: error.message });
    }
};
