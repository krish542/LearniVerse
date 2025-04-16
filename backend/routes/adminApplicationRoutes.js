const express = require('express');
const router = express.Router();
const adminApplicationController = require('../controllers/adminApplicationController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/resumes')); // Store resumes in the 'uploads/resumes' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Account creation route
router.post('/create-account', adminApplicationController.createAccount);

// Login route
router.post('/login', adminApplicationController.login);

// Route to submit application details with resume upload and authentication
router.post('/submit-details', adminApplicationController.verifyToken, upload.single('resume'), adminApplicationController.submitDetails);

// Route to check application status (requires authentication)
router.get('/status', adminApplicationController.verifyToken, adminApplicationController.checkApplicationStatus);

// Route to withdraw application (requires authentication)
router.post('/withdraw', adminApplicationController.verifyToken, adminApplicationController.withdrawApplication);

// Admin routes (you might want to add more specific admin authentication later)
router.get('/admin/applications', adminApplicationController.getAdminApplications);
router.get('/admin/applications/:userId', adminApplicationController.getAdminViewApplication);

module.exports = router;