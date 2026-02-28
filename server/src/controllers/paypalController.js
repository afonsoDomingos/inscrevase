const { Client, Environment, OrdersController, PaymentsController } = require('@paypal/paypal-server-sdk');
const User = require('../models/User');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const Submission = require('../models/Submission');
const { getDynamicPlanConfig } = require('../utils/planConfigs');
const { PLANS } = require('../config/stripe');
const { getLatestRate } = require('../utils/currencyUtils');

// Initialize PayPal client
const client = new Client({
    clientCredentialsAuthCredentials: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_SECRET,
    },
    environment: process.env.PAYPAL_MODE === 'live' ? Environment.Live : Environment.Sandbox,
});

const ordersController = new OrdersController(client);

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

        // PayPal uses USD for most international transactions if MZN is not supported by Sandbox directly
        const finalCurrency = currency === 'MZN' ? 'USD' : currency;
        const rate = (currency === 'MZN' && finalCurrency === 'USD') ? await getLatestRate() : 1;
        const amount = (planConfig.price / rate).toFixed(2);

        const body = {
            intent: 'CAPTURE',
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: finalCurrency,
                        value: amount,
                    },
                    description: `Plano ${plan.toUpperCase()} - Inscreva-se`,
                    customId: JSON.stringify({ userId, plan, type: 'subscription' })
                },
            ],
        };

        const { result } = await ordersController.ordersCreate(body);
        res.status(200).json(result);
    } catch (error) {
        console.error('PayPal Create Subscription Order Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * CREATE ORDER FOR EVENT REGISTRATION (WITH PLATFORM FEE)
 */
exports.createEventOrder = async (req, res) => {
    try {
        const { formId, submissionData } = req.body;

        const form = await Form.findById(formId).populate('creator');
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const mentor = form.creator;
        if (!mentor.paypalEmail) {
            // Se o mentor não tiver PayPal configurado, não podemos usar Platform Fees automáticos
            // Mas no PayPal Partner podemos usar o e-mail dele como Payee
            // Fallback para o admin (plataforma) se necessário? Melhor não para evitar confusão de quem recebe
            return res.status(400).json({ message: 'Este mentor ainda não configurou o PayPal para receber pagamentos.' });
        }

        const mentorPlan = mentor.plan || 'free';
        const dynamicPlans = await getDynamicPlanConfig();
        const planConfig = dynamicPlans[mentorPlan] || dynamicPlans.free || PLANS.free;

        const price = form.paymentConfig.price;
        const commissionRate = planConfig.commissionRate;
        const platformFee = (price * commissionRate).toFixed(2);

        const currency = form.paymentConfig.currency === 'MT' ? 'USD' : form.paymentConfig.currency;
        const rate = (form.paymentConfig.currency === 'MT') ? await getLatestRate() : 1;

        const totalAmount = (price / rate).toFixed(2);
        const feeAmount = (platformFee / rate).toFixed(2);

        const body = {
            intent: 'CAPTURE',
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: currency,
                        value: totalAmount,
                    },
                    payee: {
                        emailAddress: mentor.paypalEmail,
                    },
                    paymentInstruction: {
                        disbursementMode: 'INSTANT',
                        platformFees: [
                            {
                                amount: {
                                    currencyCode: currency,
                                    value: feeAmount,
                                },
                            },
                        ],
                    },
                    description: `Inscrição: ${form.title}`,
                    customId: JSON.stringify({
                        formId,
                        submissionData,
                        type: 'event_registration',
                        mentorId: mentor._id.toString()
                    })
                },
            ],
        };

        const { result } = await ordersController.ordersCreate(body);
        res.status(200).json(result);
    } catch (error) {
        console.error('PayPal Create Event Order Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * CAPTURE AND COMPLETE ORDER
 */
exports.captureOrder = async (req, res) => {
    try {
        const { orderID } = req.body;
        const { result } = await ordersController.ordersCapture(orderID);

        if (result.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Payment not completed', status: result.status });
        }

        const capture = result.purchaseUnits[0].payments.captures[0];
        const customData = JSON.parse(result.purchaseUnits[0].customId);

        console.log('✅ PayPal Payment Captured:', capture.id);
        console.log('📦 Data:', customData);

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
            const rate = await getLatestRate();
            const tx = new Transaction({
                type: 'subscription',
                subscriptionPlan: plan,
                user: userId,
                amount: amount,
                currency: capture.amount.currencyCode,
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
            const rate = await getLatestRate();
            const fee = capture.sellerReceivableBreakdown?.platformFees?.[0]?.amount?.value || 0;
            const mentorEarnings = amount - parseFloat(fee);

            const transaction = new Transaction({
                type: 'event_registration',
                user: mentorId,
                mentor: mentorId,
                form: formId,
                submission: submission._id,
                amount: amount,
                currency: capture.amount.currencyCode,
                baseAmount: amount * rate,
                exchangeRate: rate,
                platformFee: parseFloat(fee),
                basePlatformFee: parseFloat(fee) * rate,
                mentorEarnings: mentorEarnings,
                baseMentorEarnings: mentorEarnings * rate,
                status: 'completed',
                paymentMethod: 'paypal',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id
            });
            await transaction.save();

            return res.status(200).json({ success: true, type: 'event_registration', submissionId: submission._id });
        }

        res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('PayPal Capture Order Error:', error);
        res.status(500).json({ message: error.message });
    }
};
