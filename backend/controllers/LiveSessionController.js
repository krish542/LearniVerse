// backend/controllers/LiveSessionController.js
const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
exports.createLiveSession = async (req, res) => {
  try {
    const { title, courseId, meetLink, scheduledAt, description } = req.body;
    const teacherId = req.user._id;

    const newSession = new LiveSession({
      title,
      courseId,
      teacherId,
      meetLink,
      description,
      scheduledAt,
    });

    await newSession.save();
    res.status(201).json({ message: 'Live session created', session: newSession });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
};

exports.getTeacherSessions = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const sessions = await LiveSession.find({ teacherId }).populate('courseId', 'title');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: err.message });
  }
};
exports.updateLiveSession = async (req, res) => {
    const { sessionId } = req.params;
  const { title, description, scheduledAt, durationMinutes, courseId, meetLink } = req.body;

  try {
    // Find the session to update
    const session = await LiveSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update session fields
    session.title = title || session.title;
    session.description = description || session.description;
    session.scheduledAt = scheduledAt || session.scheduledAt;
    session.durationMinutes = durationMinutes || session.durationMinutes;
    session.courseId = courseId || session.courseId;
    session.meetLink = meetLink || session.meetLink;

    // Save the updated session
    await session.save();

    return res.status(200).json({ message: 'Session updated successfully', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update session' });
  }
};
exports.deleteSession = async (req, res) => {
    const { sessionId } = req.params;
  
    try {
      const session = await LiveSession.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      // Delete the session
      await session.remove();
  
      return res.status(200).json({ message: 'Session deleted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to delete session' });
    }
  };