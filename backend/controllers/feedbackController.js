//backend/controllers/feedbackController.js
const Feedback = require('../models/Feedback'); // Ensure 'require' is used for imports
const { sendEmail } = require('../utils/email');
const createFeedback = async (req, res) => {
  try {
    const { message, rating, contactEmail } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Feedback message is required' });
    }

    const newFeedback = new Feedback({ message, rating, contactEmail });
    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit feedback', error: err.message });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedbacks', error: err.message });
  }
};
const sendFeedbackResponse = async (req, res) => {
    const { id } = req.params;
    const { message, email, responder } = req.body;
  
    try {
        await sendEmail({
            email,
            subject: "Response to your feedback",
            html: `<p>${message}</p>`
          });
  
      const feedback = await Feedback.findById(id);
      if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
      feedback.responses.push({
        message,
        responder: req.member.name || "Team Member", // ✅ uses middleware-attached member
      });
      await feedback.save();
  
      res.status(200).json({ success: true, updated: feedback });
    } catch (err) {
        console.error("Error responding to feedback", err);
      res.status(500).json({ error: "Failed to send response" });
    }
  };
module.exports = { createFeedback, getAllFeedbacks, sendFeedbackResponse }; // Use CommonJS exports
