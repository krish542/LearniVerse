//backend/routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { requireTeacherAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const courseController = require('../controllers/courseController');

// Auth
router.post('/teacher/register', teacherController.registerTeacher);
router.post('/teacher/login', teacherController.loginTeacher);

// Profile
router.route('/teacher/profile')
  .put(requireTeacherAuth, teacherController.updateTeacherProfile)
  .get(requireTeacherAuth, teacherController.getTeacherProfile);

// Application
const appFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'degreeCertificates', maxCount: 5 },
  { name: 'idProof', maxCount: 1 }
]);

router.post('/teacher/apply', requireTeacherAuth, appFields, teacherController.submitTeacherApplication);
router.put('/teacher/apply', requireTeacherAuth, appFields, teacherController.updateTeacherApplication);

// Course
router.post('/courses/add', requireTeacherAuth, upload.single('thumbnail'), courseController.addCourse);
router.get('/teacher/courses', requireTeacherAuth, courseController.getTeacherCourses);
router.get('/teacher/courses/:courseId', requireTeacherAuth, courseController.getCourseById);
router.put('/teacher/courses/:courseId', requireTeacherAuth, upload.single('thumbnail'), courseController.updateCourse);

// Lectures
router.post('/teacher/courses/:courseId/lectures',
  requireTeacherAuth,
  courseController.addLectureToCourse
);
router.get('/teacher/getAllTeachers', teacherController.getAllTeachers);
router.get('/teacher/:teacherId', teacherController.getTeacherById);
/*router.post('/test-lecture-upload', (req, res) => {
  console.log("Reached /test-lecture-upload");
  res.json({ message: "Test endpoint reached" });
});*/
router.delete('/teacher/courses/:courseId/lectures/:lectureId', requireTeacherAuth, courseController.removeLectureFromCourse);
router.put('/teacher/courses/:courseId/lectures/:lectureId',
  requireTeacherAuth,
  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'notes', maxCount: 1 }]),
  courseController.updateLecture
);
module.exports = router;
