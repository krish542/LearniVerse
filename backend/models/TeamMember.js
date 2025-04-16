const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: {
    type: String,
    enum: ['not-submitted', 'submitted', 'approved', 'rejected'],
    default: 'not-submitted'
  },
  resume: { type: String }, // file path
  address: { type: String },
  phone: { type: String },
  gender: { type: String },
  currentEmployment: { type: String },
  education: { type: String },
  experience: { type: String },
  qualifications: { type: String },
  applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);