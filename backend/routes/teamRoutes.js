const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember');
const teamController = require('../controllers/teamController');  // Correct import for teamController
const { protectTeam } = require('../middleware/protectTeam');  // Correct middleware import
const { verifyTeamMember } = require('../middleware/teamAuth');  // Correct middleware import
const multer = require('multer');
const path = require('path');
const { sendTeamApplicationSubmittedEmail } = require('../utils/email');  // Make sure this is imported correctly

// Multer configuration for handling file uploads (e.g., resume)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/teamUploads/');  // Ensure this directory exists for storing uploads
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;  // Ensure unique filenames
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Public routes (for registration and login)
router.post('/register', teamController.registerTeamMember);
router.post('/login', teamController.loginTeamMember);

// Protected routes for team members (these routes require authentication)
router.get('/profile', protectTeam, teamController.getTeamProfile);
router.post('/application', protectTeam, upload.single('resume'), teamController.submitTeamApplication);  // Team member application route
router.put('/application', protectTeam, upload.single('resume'), teamController.updateTeamApplication);  // Update application route

// Admin routes (for managing team members)
router.get('/all', teamController.getAllTeamMembers);  // Admin route to get all team members
router.put('/status/:id', teamController.updateTeamStatus);  // Admin route to update team member status

module.exports = router;