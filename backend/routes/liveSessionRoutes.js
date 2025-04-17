const express = require('express');
const { createLiveSession, getTeacherSessions, updateLiveSession, deleteSession } = require('../controllers/LiveSessionController');
const { requireTeacherAuth } = require('../middleware/authMiddleware');  // Assuming this is your authentication middleware

const router = express.Router();

// Create a new live session
router.post('/', requireTeacherAuth, createLiveSession);

// Get all sessions for a teacher
router.get('/', requireTeacherAuth, getTeacherSessions);

// Update an existing live session by ID
router.put('/:sessionId', requireTeacherAuth, updateLiveSession);

// Delete a live session by ID
router.delete('/:sessionId', requireTeacherAuth, deleteSession);

module.exports = router;
