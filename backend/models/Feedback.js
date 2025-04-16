//backend/models/Feedback.js
const mongoose = require('mongoose'); // Ensure 'require' is used for imports

const feedbackSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    contactEmail: { type: String },
    responses: [
        {
          message: String,
          sentAt: { type: Date, default: Date.now },
          responder: String
        }
      ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema); // Use CommonJS exports
