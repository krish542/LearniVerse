const Enrollment = require('../models/Enrollment');

exports.enrollInCourse = async (req, res) => {
  const { studentId, courseId } = req.body;

  try {
    const existingEnrollment = await Enrollment.findOne({ studentId, courseId });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course.' });
    }

    const enrollment = new Enrollment({
      studentId,
      courseId,
      progress: {
        lecturesCompleted: [],
        quizzesCompleted: [],
        assignmentsSubmitted: []
      }
    });

    await enrollment.save();

    res.status(201).json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getEnrollment = async (req, res) => {
  const { courseId, studentId } = req.params;

  try {
    const enrollment = await Enrollment.findOne({ courseId, studentId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled' });
    }
    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
