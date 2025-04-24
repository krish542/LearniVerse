//backend/controllers/teacherController.js
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendApplicationSubmittedEmail, sendApplicationUpdatedEmail } = require('../utils/email');

// Register a new teacher
exports.registerTeacher = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    const existingEmail = await Teacher.findOne({ email });
    const existingUsername = await Teacher.findOne({ username });

    if (existingEmail || existingUsername) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({
      fullName,
      email,
      username,
      password: hashedPassword
    });

    await newTeacher.save();
    res.status(201).json({ message: 'Teacher registered successfully' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Failed to register teacher' });
  }
};

// Login
exports.loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;
    const teacher = await Teacher.findOne({ $or: [{ username }, { email: username }] });

    if (!teacher) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
};

// Update profile
exports.updateTeacherProfile = async (req, res) => {
  try {
    const updates = req.body;
    const teacher = await Teacher.findByIdAndUpdate(req.user.id, updates, { new: true });

    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.json({ message: 'Profile updated', teacher });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get profile
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).select('-password');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    res.json({ teacher });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};
// Get all teachers (optionally only approved ones)
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ applicationStatus: 'accepted' }).select('_id fullName subjectsCanTeach');
    res.json(teachers);
    //console.log('Fetched Teachers: ', teachers);
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
};

// Submit application
exports.submitTeacherApplication = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = { ...req.body };
    const files = req.files;

    if (data.institutions) {
      try {
        data.institutions = JSON.parse(data.institutions);
      } catch {
        return res.status(400).json({ message: 'Invalid institutions data' });
      }
    }

    if (files?.profilePhoto?.[0]) data.profilePhoto = files.profilePhoto[0].filename;
    if (files?.degreeCertificates) data.degreeCertificates = files.degreeCertificates.map(f => f.filename);
    if (files?.idProof?.[0]) data.idProof = files.idProof[0].filename;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const updated = await Teacher.findByIdAndUpdate(
      teacherId,
      {
        ...data,
        applicationStatus: 'submitted',
        submissionCount: (teacher.submissionCount || 0) + 1,
      },
      { new: true, runValidators: true }
    );

    sendApplicationSubmittedEmail(updated.email, updated.fullName);
    res.json({ message: 'Application submitted', teacher: updated });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
};

// Update application
exports.updateTeacherApplication = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const updates = { ...req.body };
    const files = req.files;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    if (updates.institutions) {
      try {
        updates.institutions = JSON.parse(updates.institutions);
      } catch {
        return res.status(400).json({ message: 'Invalid institutions data' });
      }
    }

    if (files?.profilePhoto?.[0]) updates.profilePhoto = files.profilePhoto[0].filename;
    if (files?.degreeCertificates) updates.degreeCertificates = files.degreeCertificates.map(f => f.filename);
    if (files?.idProof?.[0]) updates.idProof = files.idProof[0].filename;

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { ...updates, applicationStatus: 'pending' },
      { new: true, runValidators: true }
    );

    sendApplicationUpdatedEmail(updatedTeacher.email, updatedTeacher.fullName);
    res.json({ message: 'Application updated', teacher: updatedTeacher });

  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
};
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId)
      .select('fullName subjectsCanTeach email'); // Only return needed fields
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
};