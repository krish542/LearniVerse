// backend/models/Competition.js
const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  submissionGuidelines: { type: String }, // PDF, Image, or Doc URL
  poster: { type: String }, // Optional Image URL
}, { timestamps: true });

module.exports = mongoose.model('Competition', competitionSchema);
