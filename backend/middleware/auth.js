const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  console.log('--- Auth Middleware ---');
  const token = req.header('x-auth-token');
  console.log('Token from header:', token);

  if (!token) {
    console.log('No token, authorization denied');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully. Decoded payload:', decoded);
    req.student = decoded.student;
    console.log('Student attached to request:', req.student);
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;