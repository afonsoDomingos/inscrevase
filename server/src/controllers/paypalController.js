const paypalService = require('../services/paypalService');
const User = require('../models/User');
const Form = require('../models/Form');
const Transaction = require('../models/Transaction');
const Submission = require('../models/Submission');
const { getDynamicPlanConfig } = require('../utils/planConfigs');
const { PLANS } = require('../config/stripe');
const { getLatestRate } = require('../utils/currencyUtils');

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

        // Plan prices are in cents in PLANS config (e.g. 299 for $2.99)
        const rawPriceDecimal = planConfig.prices ? (planConfig.prices[currency] / 100) : (planConfig.price || 0);

        // PayPal uses USD for most international transactions if MZN is not supported by Sandbox directly
        const finalCurrency = currency === 'MZN' ? 'USD' : currency;
        const rate = (currency === 'MZN' && finalCurrency === 'USD') ? await getLatestRate() : 1;
        const amountValue = (rawPriceDecimal / rate).toFixed(2);

        const body = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: finalCurrency,
                        value: amountValue,
                    },
                    description: `Plano ${plan.toUpperCase()} - Inscreva-se`,
                    custom_id: JSON.stringify({ userId, plan, type: 'subscription' })
                },
            ],
        };

        console.log('🚀 Creating PayPal Subscription Order:', JSON.stringify(body, null, 2));
        const result = await paypalService.createOrder(body);
        res.status(200).json(result);
    } catch (error) {
        console.error('\n❌ PayPal Create Subscription Order Error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.message,
            details: error.response?.data || "Axios/Service Error"
        });
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
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: totalAmount,
                    },
                    payee: {
                        email_address: mentor.paypalEmail,
                    },
                    payment_instruction: {
                        disbursement_mode: 'INSTANT',
                        platform_fees: [
                            {
                                amount: {
                                    currency_code: currency,
                                    value: feeAmount,
                                },
                            },
                        ],
                    },
                    description: `Inscrição: ${form.title}`,
                    custom_id: JSON.stringify({
                        formId,
                        submissionData,
                        type: 'event_registration',
                        mentorId: mentor._id.toString()
                    })
                },
            ],
        };

        console.log('🚀 Creating PayPal Event Order:', JSON.stringify(body, null, 2));
        const result = await paypalService.createOrder(body);
        res.status(200).json(result);
    } catch (error) {
        console.error('\n❌ PayPal Create Event Order Error:', error.response?.data || error.message);
        res.status(500).json({
            message: error.message,
            details: error.response?.data || "Axios/Service Error"
        });
    }
};

/**
 * CAPTURE AND COMPLETE ORDER
 */
exports.captureOrder = async (req, res) => {
    try {
        const { orderID } = req.body;
        console.log('🧐 Capturing PayPal Order:', orderID);
        const result = await paypalService.captureOrder(orderID);

        // LOG FULL RESULT FOR DEEP DEBUGGING IN RENDER
        console.log('📦 PayPal Capture Response:', JSON.stringify(result, null, 2));

        if (result.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Payment not completed', status: result.status });
        }

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

        let customData;
        try {
            customData = JSON.parse(rawCustomId);
        } catch (e) {
            console.error('❌ JSON Parse Error for custom_id:', rawCustomId);
            throw new Error(`"custom_id" is not valid JSON: ${rawCustomId}`);
        }

        console.log('✅ PayPal Payment Captured:', capture.id);
        console.log('📦 Parsed Custom Data:', customData);

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
                paymentMethod: 'paypal',
                paypalOrderId: orderID,
                paypalCaptureId: capture.id
            });
            await transaction.save();

            return res.status(200).json({ success: true, type: 'event_registration', submissionId: submission._id });
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

        // Verification (Optional but recommended - requires extra SDK call or manual HMAC)
        // For now, we process common events

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

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ PayPal Webhook Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
