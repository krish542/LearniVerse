//backend/controllers/courseController.js
const Course = require('../models/Course');
const fs = require('fs').promises;
const path = require('path');
const upload = require('../middleware/uploadMiddleware');
const multer = require('multer');
exports.addCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const thumbnail = req.file?.path;

    const course = new Course({
      title,
      description,
      price,
      category,
      thumbnail,
      instructor: req.user._id,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('Add course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeacherCourses = async (req, res) => {
  try {
    console.log("Fetching courses for teacher:", req.user._id); 
    const courses = await Course.find({ instructor: req.user._id });
    console.log("Fetched courses:", courses); 
    res.status(200).json(courses);
  } catch (err) {
    console.error('Fetch teacher courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const updates = { title, description, price, category };
    if (req.file) {
      updates.thumbnail = req.file.path;
      // Optionally delete the old thumbnail if it exists
      const course = await Course.findById(req.params.courseId);
      if (course && course.thumbnail && req.file.path !== course.thumbnail) {
        await fs.unlink(path.join(__dirname, '..', course.thumbnail)).catch(() => {});
      }
    }
    const course = await Course.findByIdAndUpdate(req.params.courseId, updates, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addLectureToCourse = async (req, res) => {
  try {
    // First handle the file upload
    await new Promise((resolve, reject) => {
      upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'notes', maxCount: 1 },
      ])(req, res, (err) => {
        if (err) {
          console.error("Multer error:", err);
          return reject(err);
        }
        resolve();
      });
    });

    console.log("📦 req.body:", req.body);
    console.log("📁 req.files:", req.files);

    const { title, description, duration } = req.body;
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lecture = {
      title,
      description,
      duration,
      videoUrl: req.files?.video?.[0]?.path.replace(/^.*uploads[\\/]/, 'uploads/') || null,
      notes: req.files?.notes?.[0]?.path.replace(/^.*uploads[\\/]/, 'uploads/') || null,
    };

    course.lectures.push(lecture);
    await course.save();

    res.status(201).json({ message: 'Lecture added', lecture });
  } catch (error) {
    console.error("Error adding lecture:", error);
    res.status(500).json({ 
      message: error.message || 'Server error while saving lecture' 
    });
  }
};
exports.removeLectureFromCourse = async (req, res) => {
try {
  const { courseId, lectureId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const lecture = course.lectures.id(lectureId);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
  // Optional: Remove files from system
  if (lecture.videoUrl) await fs.unlink(path.join(__dirname, '..', lecture.videoUrl)).catch(() => {});
  if (lecture.notes) await fs.unlink(path.join(__dirname, '..', lecture.notes)).catch(() => {});
  course.lectures = course.lectures.filter(l => l._id.toString() !== lectureId);
  await course.save();
  res.json({ message: 'Lecture removed' });
} catch (err) {
  console.error('Remove lecture error:', err);
  res.status(500).json({ message: 'Server error' });
}
};

exports.getAllCourses = async (req, res) => {
  try {
    const { category, price, sortBy, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }
    if (price) {
      if (price === 'free') {
        query.price = 0;
      } else if (price === 'paid') {
        query.price = { $gt: 0 };
      }
    }
    let sortOptions = {};
    if (sortBy === 'priceLowToHigh') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'priceHighToLow') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'trending') {
      sortOptions = { createdAt: -1 };
    }
    const courses = await Course.find(query).sort(sortOptions).skip((page-1)*limit).limit(Number(limit)).populate('instructor', 'fullName email');
    res.status(200).json(courses);
  } catch (err) {
    console.error('Get all courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    const student = req.user;
    const courseId = req.params.id;

    if (!student.courses.includes(courseId)) {
      student.courses.push(courseId);
      await student.save();
    }

    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateLecture = [
  (req, res, next) => {
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'notes', maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${err.message}` });
      } else if (err) {
        return res.status(500).json({ message: `Server error during file upload: ${err}` });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { title, description, duration } = req.body;
      const { courseId, lectureId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });

      const lecture = course.lectures.id(lectureId);
      if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

      lecture.title = title || lecture.title;
      lecture.description = description || lecture.description;
      lecture.duration = duration || lecture.duration;

      if (req.files?.video?.[0]?.path) {
        // Optionally delete the old video file
        if (lecture.videoUrl) {
          await fs.unlink(path.join(__dirname, '..', lecture.videoUrl)).catch(() => {});
        }
        lecture.videoUrl = req.files.video[0].path;
      }

      if (req.files?.notes?.[0]?.path) {
        // Optionally delete the old notes file
        if (lecture.notes) {
          await fs.unlink(path.join(__dirname, '..', lecture.notes)).catch(() => {});
        }
        lecture.notes = req.files.notes[0].path;
      }

      await course.save();
      res.json(lecture);
    } catch (err) {
      console.error('Update lecture error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },
];

exports.getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate('courses');
    res.json(student.courses);
  } catch (err) {
    console.error('Get student courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getFeaturedCourses = async (req, res) => {
  try {
    // You can decide your logic here. E.g., fetch top 6 monetized or latest added courses
    const courses = await Course.find().sort({ createdAt: -1 }).limit(6);
    res.status(200).json(courses);
  } catch (err) {
    console.error('Get featured courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
