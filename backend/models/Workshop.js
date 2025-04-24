const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sampleOutline: { type: String },

  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'finalized'],
    default: 'pending',
  },

  suggestedByAdmin: {
    sessions: { type: Number, default: 1 },
    suggestedDates: [{ type: Date }],
  },

  suggestedByTeacher: {
    sessions: { type: Number },
    suggestedDates: [{ type: Date }],
  },

  final: {
    totalSessions: { type: Number },
    confirmedDates: [{ type: Date }],
    meetLinks: [{ type: String }],
  },

  feedback: { type: String }, // Optional feedback (from teacher or admin)
}, { timestamps: true });

module.exports = mongoose.model('Workshop', workshopSchema);