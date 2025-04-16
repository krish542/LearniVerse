// backend/controllers/adminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const TeamMember = require('../models/TeamMember');
const moment = require('moment');
// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id, role: admin.role, permissions: admin.permissions }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, admin });
  } catch (err) {
    console.error('Error admin login:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create Admin (Main Admin Only)
exports.createAdmin = async (req, res) => {
  try {
    const { username, password, role, permissions } = req.body;
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword, role, permissions });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (err) {
    console.error('Error creating admin:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Admins (Main Admin Only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) {
    console.error('Error getting all admins:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update Admin (Main Admin Only)
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, permissions } = req.body;
    if (password) {
      req.body.password = await bcrypt.hash(password, 10);
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(updatedAdmin);
  } catch (err) {
    console.error('Error updating admin:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete Admin (Main Admin Only)
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create First Admin(No token required)
exports.createFirstAdmin = async (req, res) => {
  try {
    const { username, password, role, permissions } = req.body;
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({ message: 'First admin already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword, role, permissions });
    await newAdmin.save();
    res.status(201).json({ message: 'First admin created successfully', admin: newAdmin });
  } catch (err) {
    console.error('Error creating first admin:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalTeamMembers = await TeamMember.countDocuments();
    const totalViewers = await Viewer.countDocuments(); // or sessions?
    const reportsThisMonth = await Report.countDocuments({ createdAt: { $gte: monthStart } });
    const feedbacksThisMonth = await Feedback.countDocuments({ createdAt: { $gte: monthStart } });

    // optional: calculate average rating
    const avgRating = await Feedback.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.status(200).json({
      totalUsers,
      totalCourses,
      totalTeachers,
      totalTeamMembers,
      totalViewers,
      reportsThisMonth,
      feedbacksThisMonth,
      avgRating: avgRating[0]?.avg || 0,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};
exports.getUserGrowthStats = async(req,res) => {
  try {
    const range = []; // Past 8 weeks
    for (let i = 7; i >= 0; i--) {
      const start = moment().subtract(i, 'weeks').startOf('week').toDate();
      const end = moment().subtract(i, 'weeks').endOf('week').toDate();
      range.push({ label: moment(start).format('MMM DD'), start, end });
    }

    const results = await Promise.all(
      range.map(async ({ label, start, end }) => {
        const [students, teachers, teams] = await Promise.all([
          Student.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          Teacher.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          TeamMember.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        ]);

        return { date: label, students, teachers, teams };
      })
    );

    res.json(results);
  } catch (err) {
    console.error('User growth stats error:', err);
    res.status(500).json({ error: 'Failed to fetch user growth stats' });
  }
};