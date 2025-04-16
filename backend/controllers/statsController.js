const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const TeamMember = require('../models/TeamMember');
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');

exports.getUserStats = async (req, res) => {
  try {
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments();
    const teams = await TeamMember.countDocuments();

    res.json({ students, teachers, teams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);

    const result = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(oneWeekAgo.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const reports = await Report.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      const feedbacks = await Feedback.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      result.push({
        date: date.toISOString().split('T')[0],
        reports,
        feedbacks
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report stats' });
  }
};

exports.getApprovalStats = async (req, res) => {
  try {
    const teacherStats = await Teacher.aggregate([
      { $group: { _id: '$applicationStatus', count: { $sum: 1 } } }
    ]);

    const teamStats = await TeamMember.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = (arr) =>
      arr.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

    res.json({
      teachers: statusMap(teacherStats),
      teamMembers: statusMap(teamStats)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approval stats' });
  }
};
