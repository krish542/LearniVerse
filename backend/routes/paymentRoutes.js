const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// Public webhook endpoint (no auth)
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);

// Authenticated routes
router.use(authMiddleware);
router.post('/checkout-session', paymentController.createCheckoutSession);
router.get('/verify', paymentController.verifyPayment);

module.exports = router;