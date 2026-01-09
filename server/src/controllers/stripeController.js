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
            country: user.country || 'US',
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
        console.error('Stripe Connect Error:', error);
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
        if (!form) return res.status(404).json({ message: 'Form not found' });

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
                    currency: form.paymentConfig.currency.toLowerCase(),
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

exports.verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Check if already processed
        const existingTx = await Transaction.findOne({ stripePaymentIntentId: session.payment_intent.id });
        if (existingTx) {
            return res.status(200).json({ success: true, message: 'Already processed' });
        }

        const metadata = session.metadata;
        const submissionData = JSON.parse(metadata.submissionData);

        // Create submission
        const submission = new Submission({
            form: metadata.formId,
            data: submissionData,
            paymentMethod: 'stripe',
            stripePaymentIntentId: session.payment_intent.id,
            stripeSessionId: session.id,
            status: 'approved',
            paymentStatus: 'paid'
        });
        await submission.save();

        // Create transaction
        const transaction = new Transaction({
            user: submission.form.creator, // This will be fixed in post-save or populated
            mentor: session.payment_intent.metadata.mentorId,
            form: metadata.formId,
            submission: submission._id,
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            platformFee: (session.payment_intent.application_fee_amount || 0) / 100,
            mentorEarnings: (session.amount_total - (session.payment_intent.application_fee_amount || 0)) / 100,
            status: 'completed',
            stripePaymentIntentId: session.payment_intent.id
        });
        await transaction.save();

        res.status(200).json({
            success: true,
            submission: submission._id,
            transaction: transaction._id
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
            mentor: mentorId,
            status: 'completed'
        }).populate('form', 'title slug').sort({ createdAt: -1 });

        // Simple aggregation
        const summary = transactions.reduce((acc, tx) => {
            acc.totalRevenue += tx.amount;
            acc.totalEarnings += tx.mentorEarnings;
            acc.totalFees += tx.platformFee;
            return acc;
        }, { totalRevenue: 0, totalEarnings: 0, totalFees: 0 });

        res.status(200).json({
            success: true,
            summary,
            transactions: transactions.slice(0, 10)
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
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle events
    if (event.type === 'account.updated') {
        const account = event.data.object;
        const user = await User.findOne({ stripeAccountId: account.id });
        if (user) {
            user.stripeOnboardingComplete = account.details_submitted && account.charges_enabled;
            await user.save();
        }
    }

    res.json({ received: true });
};

exports.createSubscription = async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findById(req.user.id);

        const planConfig = PLANS[plan];
        if (!planConfig || plan === 'free') {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [{
                price_data: {
                    currency: planConfig.currency.toLowerCase(),
                    product_data: { name: `Inscreva-se ${planConfig.name} Plan` },
                    unit_amount: planConfig.price,
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
