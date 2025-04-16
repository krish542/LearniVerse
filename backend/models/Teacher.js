// backend/models/Teacher.js
const { application } = require('express');
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
    //Basic Personal Information
    password: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    applicationStatus: {
      type: String, 
      enum: ['not_submitted', 'pending', 'accepted', 'rejected', 'submitted'],
      default: 'not_submitted',
    },
    phoneNumber: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    profilePhoto: {
      type: String, // Store the path or URL of the profile photo
    },

    //Education & Qualifications
    highestQualification: {
      type: String,
    },
    institutions: [
      {
        name: String,
        yearOfGraduation: String,
      },
    ],
    certifications: [String],
    degreeCertificates: [String], // Array of paths to uploaded files

    // Teaching Experience
    teachingExperienceYears: {
      type: Number,
    },
    subjectsCanTeach: [String],
    levelsCanTeach: [String],
    languagesCanTeachIn: [String],
    previousPlatforms: [String],

    //Verification & Compliance
    idProof: {
      type: String, // Path to uploaded ID proof
    },
    backgroundCheckConsent: {
      type: Boolean,
      default: false,
    },
    termsAndConditionsAgreed: {
      type: Boolean,
      default: false,
    },

    // System-related fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
  },
  
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;