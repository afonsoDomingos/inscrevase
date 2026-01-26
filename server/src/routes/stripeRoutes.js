const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/test', (req, res) => res.json({ message: 'Stripe routes are active' }));
router.get('/whoami', stripeController.whoami);

/**
 * STRIPE CONNECT ROUTES
 */

// Create Stripe Connect account for mentor
router.post('/connect/create', authMiddleware, stripeController.createConnectAccount);

// Get onboarding link
router.get('/connect/onboarding', authMiddleware, stripeController.getOnboardingLink);

// Check account status
router.get('/connect/status', authMiddleware, stripeController.getAccountStatus);

/**
 * PAYMENT ROUTES
 */

// Create checkout session for event payment
router.post('/checkout/create', stripeController.createCheckoutSession);

// Verify payment after checkout
router.post('/payment/verify', stripeController.verifyPayment);

/**
 * EARNINGS & ANALYTICS
 */

// Get earnings dashboard (mentor only)
router.get('/earnings', authMiddleware, stripeController.getEarningsDashboard);

/**
 * ADMIN FINANCE ROUTES
 */

// Get all transactions for admin
router.get('/admin/transactions', authMiddleware, adminMiddleware, stripeController.getAdminTransactions);

// Get financial summary for admin
router.get('/admin/summary', authMiddleware, adminMiddleware, stripeController.getAdminFinancialSummary);

// Confirm manual fee payment
router.patch('/admin/confirm-payment/:transactionId', authMiddleware, adminMiddleware, stripeController.confirmTransactionPayment);

/**
 * SUBSCRIPTION ROUTES
 */

// Create subscription for plan upgrade
router.post('/subscription/create', authMiddleware, stripeController.createSubscription);
router.post('/subscription/sync', authMiddleware, stripeController.syncSubscription);
router.post('/subscription/portal', authMiddleware, stripeController.createPortalSession);
router.post('/subscription/manual', authMiddleware, stripeController.submitManualSubscription);
router.get('/plans', stripeController.getPlans);

// Refund route
router.post('/refund/:submissionId', authMiddleware, stripeController.refundPayment);

/**
 * WEBHOOKS
 */


// Stripe webhooks - Handled in index.js to allow raw body parsing
// router.post('/webhook', stripeController.handleWebhook);


module.exports = router;
