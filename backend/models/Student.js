// backend/models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
  },
  avatar: {
    head: {
      type: String, // e.g., 'female-head1.png' or 'male-head3.png'
      default: 'male-head1.png', // Set a default head
    },
    body: {
      type: String,
      default: 'male-body1.png', // Set a default body
    },
    legs: {
      type: String,
      default: 'male-legs1.png', // Set default legs
    },
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
  achievements: [{
    type: String,
  }],
  badges: [{
    type: String,
  }],
  certifications: [{
    type: String,
  }],
  studyGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
  }],
  changePasswordOTP: {
    type: String,
    default: null // Or undefined
},
changePasswordOTPExpires: {
    type: Date,
    default: null // Or undefined
},
resetPasswordToken:{
  type: String,
  default: null //or undefined
},
resetPasswordExpires: {
    type: Date,
    default: null //or undefined
},
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);