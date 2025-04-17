import mongoose from 'mongoose';

const workshopEventSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Workshop title
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },

  description: { type: String }, // Optional description of the workshop

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
    meetLinks: [{ type: String }], // One link per confirmed session
  },

  timestamps: true
}, { timestamps: true });

export default mongoose.model('WorkshopEvent', workshopEventSchema);
