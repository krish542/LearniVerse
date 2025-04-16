const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');

// POST /api/payment/checkout-session
router.post('/checkout-session', createCheckoutSession);

module.exports = router;