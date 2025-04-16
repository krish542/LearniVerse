const mongoose = require('mongoose'); // Ensure 'require' is used for imports

const reportSchema = new mongoose.Schema(
  {
    issueType: { type: String, required: true, enum: ['Bug', 'Error', 'Abuse', 'Other'] },
    description: { type: String, required: true },
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

module.exports = mongoose.model("Report", reportSchema); // Use CommonJS exports
