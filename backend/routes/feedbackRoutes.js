const express = require('express');
const router = express.Router();
const {verifyTeamMember} = require('../middleware/teamAuth');
const { createFeedback, getAllFeedbacks, sendFeedbackResponse } = require('../controllers/feedbackController');

router.post('/', createFeedback); // Correct usage of route
router.get('/', getAllFeedbacks); // Correct usage of route
router.post('/respond/:id', verifyTeamMember, sendFeedbackResponse);

module.exports = router; // Ensure CommonJS export
