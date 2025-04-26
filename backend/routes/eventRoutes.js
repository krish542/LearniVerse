// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Event Routes - Fetch all events (workshops + competitions)
router.get('/events', eventController.getAllEvents);

module.exports = router;
