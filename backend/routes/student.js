const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../transporter'); // Import the email transporter

// In-memory OTP storage (Replace with Redis or a database in production)
const otpStorage = {};

// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   GET api/student/profile
// @desc    Get current student's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select('-password').where({isDeleted: false});
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/student/profile
// @desc    Update current student's profile
// @access  Private
router.put(
  '/profile',
  auth,
  [
    body('firstName', 'First Name is required').not().isEmpty(),
    body('lastName', 'Last Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('mobile', 'Mobile number must be at least 10 digits')
      .optional()
      .isLength({ min: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, mobile } = req.body;

    try {
      const student = await Student.findByIdAndUpdate(
        req.student.id,
        { $set: { firstName, lastName, email, mobile } },
        { new: true } // Return the updated document
      ).select('-password');

      res.json(student);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/student/avatar
// @desc    Update current student's avatar
// @access  Private
router.put(
  '/avatar',
  auth,
  [
    body('head', 'Head is required').not().isEmpty(),
    body('body', 'Body is required').not().isEmpty(),
    body('legs', 'Legs are required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { head, body, legs } = req.body;

    try {
      const student = await Student.findByIdAndUpdate(
        req.student.id,
        { $set: { avatar: { head, body, legs } } },
        { new: true }
      ).select('-password');

      res.json(student);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const student = await Student.findOne({ email });

      if (!student) {
        return res.status(404).json({ msg: 'Email not found' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      student.resetPasswordToken = resetToken;
      student.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await student.save();

      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

      const mailOptions = {
        to: student.email,
        subject: 'Virtual University - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Dear ${student.firstName} ${student.lastName},</p>
            <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link to reset your password:</p>
            <p style="margin: 20px 0; text-align: center;">
              <a href="${resetLink}" style="background-color: #f0ad4e; color: white; padding: 14px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <hr style="border-top: 1px solid #eee;">
            <p style="font-size: 0.8em; color: #777;">Sincerely,<br>The Virtual University Team</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ msg: 'Could not send password reset email' });
        }
        console.log('Email sent:', info.response);
        res.json({ msg: 'Password reset email sent successfully. Please check your inbox.' });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/student/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.put(
  '/reset-password/:token',
  [
    body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword } = req.body;
    const { token } = req.params;

    try {
      const student = await Student.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!student) {
        console.log(`Token: ${token} not found or expired`);
        return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
      }

      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(newPassword, salt);
      student.resetPasswordToken = undefined;
      student.resetPasswordExpires = undefined;
      await student.save();

      res.json({ msg: 'Password reset successfully. You can now log in with your new password.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/student/change-password
// @desc    Change password (requires current password)
// @access  Private
router.post(
  '/change-password',
  auth,
  [
    body('oldPassword', 'Current password is required').not().isEmpty(),
    body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    try {
      const student = await Student.findById(req.student.id);
      const isMatch = await bcrypt.compare(oldPassword, student.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid current password' });
      }

      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(newPassword, salt);
      await student.save();

      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/student/send-change-password-otp
// @desc    Send OTP to user's email for password change
// @access  Private
router.post('/send-change-password-otp', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const otp = generateOTP();
    const otpExpiryTime = Date.now() + 300000; // OTP expires in 5 minutes

    // Store OTP in memory with student's ID as key (TEMPORARY - DO NOT USE IN PRODUCTION)
    otpStorage[req.student.id] = { otp, expires: otpExpiryTime };
    console.log('OTP Stored:', otpStorage[req.student.id]);

    const mailOptions = {
      to: student.email,
      subject: 'Virtual University - Change Password OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #333;">Change Password OTP</h2>
          <p>Dear ${student.firstName} ${student.lastName},</p>
          <p>Your OTP for changing your password is:</p>
          <p style="font-size: 1.5em; color: #007bff; text-align: center;"><b>${otp}</b></p>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border-top: 1px solid #eee;">
          <p style="font-size: 0.8em; color: #777;">Sincerely,<br>The Virtual University Team</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ msg: 'Failed to send OTP email' });
      }
      console.log('OTP email sent:', info.response, `OTP: ${otp}`, `Expires: ${new Date(otpExpiryTime).toLocaleTimeString()}`);
      res.json({ msg: 'OTP sent successfully to your email address.' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/student/verify-change-password-otp
// @desc    Verify OTP and change password
// @access  Private
router.post(
  '/verify-change-password-otp',
  auth,
  [
    body('otp', 'OTP is required').not().isEmpty(),
    body('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { otp, newPassword } = req.body;
    const studentId = req.student.id;

    const storedOTPData = otpStorage[studentId];

    console.log('Stored OTP Data:', storedOTPData);

    if (!storedOTPData || !storedOTPData.otp) {
      return res.status(400).json({ msg: 'No OTP found. Please request a new one.' });
    }

    if (storedOTPData.expires < Date.now()) {
      delete otpStorage[studentId]; // Clear expired OTP
      return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
    }

    if (storedOTPData.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP.' });
    }

    try {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ msg: 'Student not found' });
      }

      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(newPassword, salt);
      await student.save();

      delete otpStorage[studentId]; // Clear OTP after successful use

      res.json({ msg: 'Password changed successfully.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/students/me
// @desc    Get logged in student data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
      const student = await Student.findById(req.student.id).select('-password').where({isDeleted: false}); // Exclude password
      res.json(student);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});
// @route   DELETE api/student/profile
// @desc    Soft delete current student's profile (with password verification)
// @access  Private
router.delete(
  '/profile',
  auth,
  [body('password', 'Password is required').not().isEmpty()],
  async (req, res) => {
    console.log('DELETE /api/student/profine - req.body: ', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    try {
      const student = await Student.findById(req.student.id).select('+password'); // Include password for verification

      if (!student) {
        return res.status(404).json({ msg: 'Student not found' });
      }

      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid password' });
      }

      student.isDeleted = true;
      student.deletedAt = new Date();
      await student.save();

      res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
module.exports = router;