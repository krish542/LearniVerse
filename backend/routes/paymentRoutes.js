const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// Public webhook endpoint (no auth)
router.post('/webhook', paymentController.handleStripeWebhook);

// Authenticated routes
router.use(authMiddleware);
router.post('/checkout-session', paymentController.createCheckoutSession);
router.get('/verify/:sessionId', paymentController.verifyPayment);
router.post('/confirm', authMiddleware, paymentController.confirmPayment);

module.exports = router;