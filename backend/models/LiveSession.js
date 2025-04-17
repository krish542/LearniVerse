// backend/models/LiveSession.js
const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  meetLink: { type: String, required: true },
  description: { type: String },
  scheduledAt: { type: Date, required: true },
}, { timestamps: true });

module.exports=mongoose.model('LiveSession', liveSessionSchema);