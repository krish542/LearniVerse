const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

router.get('/',authMiddleware, cartController.getCart);
router.post('/add', authMiddleware, cartController.addItem);
router.post('/wishlist', authMiddleware, cartController.toggleWishlist);
router.delete('/remove/:courseId', authMiddleware, cartController.removeItem);
router.post('/clear', authMiddleware, cartController.clearCart);
module.exports = router;