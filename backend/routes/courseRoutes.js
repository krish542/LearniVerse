//backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all courses (public route or student-only)
router.get('/courses', courseController.getAllCourses);

// Get a specific course
router.get('/courses/:courseId', courseController.getCourseById);

// Enroll in a course
router.post('/courses/:id/enroll', authMiddleware, courseController.enrollInCourse);

// Get student's enrolled courses
router.get('/student/courses', authMiddleware, courseController.getStudentCourses);

module.exports = router;
