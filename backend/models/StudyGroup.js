// backend/models/StudyGroup.js
const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  // Add other study group related fields like events, etc.
}, { timestamps: true });

module.exports = mongoose.model('StudyGroup', StudyGroupSchema);