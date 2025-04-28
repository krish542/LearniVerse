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
/*router.get('/courses/categories', async (req, res) => {
  try {
      const categories = await Course.aggregate([
          { $group: { _id: "$category" } },
          { $project: { _id: 0, name: "$_id" } },
          { $sort: { name: 1 } }
      ]);
      
      res.status(200).json(categories.map(c => c.name));
  } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Server error' });
  }
});*/
router.get('/categories', courseController.getCategories);
// Enroll in a course
router.post('/courses/:id/enroll', authMiddleware, courseController.enrollInCourse);

router.get('/:courseId', courseController.getCourseDetails);
router.get('/video-duration/:courseId', courseController.getVideoDuration);
// Get student's enrolled courses
router.get('/student/courses', authMiddleware, courseController.getStudentCourses);
// backend/routes/courseRoutes.js
/*router.get('/categories', async (req, res) => {
    try {
      const categories = await Course.distinct('category');
      res.status(200).json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });*/
  //router.get('/categories', courseController.getCategories);
  
module.exports = router;
