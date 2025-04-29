const express = require('express');
const { enrollInCourse, getEnrollment } = require('../controllers/enrollmentController');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);
// POST /api/enrollments
router.post('/', enrollInCourse);

// GET /api/enrollments/:courseId/:studentId
router.get('/:courseId/:studentId', getEnrollment);

module.exports = router;
