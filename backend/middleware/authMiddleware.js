//backend/middleware/authMiddleware.js (teachers authentication middleware)
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const verifyToken = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = await verifyToken(token);
    const user = await Teacher.findById(decoded.id).select('-password') ||
                 await Student.findById(decoded.id).select('-password') ||
                 await Admin.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireTeacherAuth = async (req, res, next) => {
  try {
    //const token = req.headers.authorization?.split(' ')[1];
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = await verifyToken(token);
    const teacher = await Teacher.findById(decoded.id).select('-password');

    if (!teacher) return res.status(403).json({ message: 'Teacher access required' });
    req.token = token;
    req.user = teacher;
    next();
  } catch (err) {
    console.error('Teacher auth error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authMiddleware, requireTeacherAuth };