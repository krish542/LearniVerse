const TeamMember = require('../models/TeamMember');  // Ensure correct model import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  sendEmail,
  sendTeamApplicationSubmittedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendTeamApplicationRevokedEmail,
} = require('../utils/email');

// Register a new team member
exports.registerTeamMember = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newMember = new TeamMember({
      name,
      username,
      email,
      password: hashed,
    });
    await newMember.save();
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login team member
exports.loginTeamMember = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await TeamMember.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: 'subadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get team profile (protected route)
exports.getTeamProfile = async (req, res) => {
  try {
    const user = await TeamMember.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit application (protected route)
exports.submitTeamApplication = async (req, res) => {
  try {
    const id = req.user.id;
    const {
      address,
      phone,
      gender,
      currentEmployment,
      education,
      experience,
      qualifications,
    } = req.body;
    const resume = req.file?.filename; // Use optional chaining

    const member = await TeamMember.findById(id);
    if (!member) return res.status(404).json({ error: 'User not found' });

    member.address = address;
    member.phone = phone;
    member.gender = gender;
    member.currentEmployment = currentEmployment;
    member.education = education;
    member.experience = experience;
    member.qualifications = qualifications;
    member.resume = resume;
    member.status = 'submitted';
    member.applicationCount += 1;

    await member.save();

    sendTeamApplicationSubmittedEmail(member.email, member.name);
    res.json({ message: 'Application submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update team application (protected route)
exports.updateTeamApplication = async (req, res) => {
  try {
    const id = req.user.id;
    const {
      address,
      phone,
      gender,
      currentEmployment,
      education,
      experience,
      qualifications,
    } = req.body;
    const resume = req.file?.filename;

    const member = await TeamMember.findById(id);
    if (!member) return res.status(404).json({ error: 'User not found' });

    member.address = address;
    member.phone = phone;
    member.gender = gender;
    member.currentEmployment = currentEmployment;
    member.education = education;
    member.experience = experience;
    member.qualifications = qualifications;
    if (resume) member.resume = resume;

    await member.save();

    res.json({ message: 'Application updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all team members (admin route)
exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update team member status (admin route)
exports.updateTeamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const member = await TeamMember.findById(id);
    if (!member) return res.status(404).json({ error: 'User not found' });

    member.status = status;
    await member.save();

    if (status === 'approved') {
      sendApplicationApprovedEmail(member.email, member.name);
    } else if (status === 'rejected') {
      sendApplicationRejectedEmail(member.email, member.name);
    } else if (status === 'submitted') {
      console.log(`Team member ${member.email} application status revoked to submitted`);
      sendTeamApplicationRevokedEmail(member.email, member.name);
    }

    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
