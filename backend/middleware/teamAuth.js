//backend/middleware/teamAuth.js
const jwt = require('jsonwebtoken');
const TeamMember = require('../models/TeamMember');

exports.verifyTeamMember = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const member = await TeamMember.findById(decoded.id);
    if (!member) return res.status(404).json({ error: 'User not found' });
    req.member = member;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};