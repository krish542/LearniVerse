// backend/routes/messagesRoutes.js
const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

router.post('/send', messagesController.verifyToken, messagesController.sendMessage);
router.get('/', messagesController.verifyToken, messagesController.getMessages);

module.exports = router;