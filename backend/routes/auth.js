// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');

// @route   POST api/auth/signup
// @desc    Register student
// @access  Public
router.post(
  '/signup',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('firstName', 'First Name is required').not().isEmpty(),
    body('lastName', 'Last Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, firstName, lastName, email, password } = req.body;

    try {
      let student = await Student.findOne({ $or: [{ username }, { email }] });

      if (student) {
        return res.status(400).json({ msg: 'Student already exists' });
      }

      student = new Student({
        username,
        firstName,
        lastName,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);

      await student.save();

      const payload = {
        student: {
          id: student.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate student & get token
// @access  Public
router.post(
  '/login',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password is required').not().isEmpty(),
  ],
  async (req, res) => {
    console.log('Login request received:', {
      body: { ...req.body, password: '****' }, // Never log actual passwords
      headers: req.headers
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      let student = await Student.findOne({ 
        $or: [
          { username },
          { email: username } // Also try matching as email
        ] 
      });

      if (!student) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, student.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        student: {
          id: student.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, student: {
            id: student.id,
            username: student.username,
            email: student.email
          }
         });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;