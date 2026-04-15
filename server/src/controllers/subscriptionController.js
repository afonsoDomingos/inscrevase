const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypalService = require('../services/paypalService');
const User = require('../models/User');

/**
 * STRIPE: Create Billing Portal Session
 */
exports.createStripePortal = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({ message: "Utilizador não tem conta no Stripe." });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/mentor`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('❌ Stripe Portal Error:', error);
        res.status(500).json({ message: "Erro ao criar portal de faturação." });
    }
};

/**
 * PAYPAL: Cancel Subscription
 */
exports.cancelPaypalSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Find the subscription ID. It should be in our payment status or transactions.
        // For simplicity, we expect the client to send the subscriptionId, but we verify it belongs to user if possible.
        // We'll search for the most recent transaction/subscription ID associated with this user
        const subscriptionId = req.body.subscriptionId;

        if (!subscriptionId) {
            return res.status(400).json({ message: "ID da subscrição é obrigatório." });
        }

        await paypalService.cancelSubscription(subscriptionId);

        // Update user status locally (optional, webhook will also catch it)
        user.subscriptionStatus = 'cancelled';
        await user.save();

        res.json({ success: true, message: "Subscrição cancelada com sucesso no PayPal." });
    } catch (error) {
        console.error('❌ PayPal Cancel Error:', error);
        res.status(500).json({ message: "Erro ao cancelar subscrição no PayPal." });
    }
};
