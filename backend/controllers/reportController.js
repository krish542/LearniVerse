const Report = require('../models/Report'); // Ensure 'require' is used for imports
const { sendEmail } = require('../utils/email');
const submitReport = async (req, res) => {
  try {
    const { issueType, description, contactEmail } = req.body;

    if (!issueType || !description) {
      return res.status(400).json({ message: 'Issue type and description are required' });
    }

    const newReport = new Report({ issueType, description, contactEmail });
    await newReport.save();

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit report', error: err.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
};

const sendReportResponse = async (req, res) => {
    const { id } = req.params;
    const { message, email, responder } = req.body;
  
    try {
        await sendEmail({
            email,
            subject: "Response to your report",
            html: `<p>${message}</p>`
          });
  
      const report = await Report.findById(id);
      report.responses.push({
        message,
        responder
      });
      await report.save();
  
      res.status(200).json({ success: true, updated: report });
    } catch (err) {
      res.status(500).json({ error: "Failed to send response" });
    }
  };
module.exports = { submitReport, getAllReports, sendReportResponse }; 
