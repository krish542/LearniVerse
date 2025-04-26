//backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/authMiddleware');
const Course = require('../models/Course'); // Add this line

// Get all courses (public route or student-only)
router.get('/courses', courseController.getAllCourses);

// Get a specific course
router.get('/courses/:courseId', courseController.getCourseById);

// Enroll in a course
router.post('/courses/:id/enroll', authMiddleware, courseController.enrollInCourse);

// Get student's enrolled courses
router.get('/student/courses', authMiddleware, courseController.getStudentCourses);
// backend/routes/courseRoutes.js
router.get('/categories', async (req, res) => {
    try {
      const categories = await Course.distinct('category');
      res.status(200).json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;
