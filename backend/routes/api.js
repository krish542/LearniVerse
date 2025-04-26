// backend/routes/api.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Workshop = require('../models/Workshop');
const Competition = require('../models/Competition');

// Top grossing (most expensive) courses
router.get('/featured-courses', async (req, res) => {
  try {
    const courses = await Course.find({ isMonetized: true })
      .sort({ price: -1 })
      .limit(5)
      .populate('instructor', 'name');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Merged and sorted events (Workshops + Competitions)
router.get('/upcoming-events', async (req, res) => {
  try {
    const workshops = await Workshop.find({ 'final.confirmedDates.0': { $exists: true } });
    const competitions = await Competition.find({ endDate: { $gte: new Date() } });

    const formattedEvents = [
      ...workshops.map(w => ({
        type: 'workshop',
        title: w.title,
        date: w.final.confirmedDates[0],
        poster: w.poster,
        id: w._id,
      })),
      ...competitions.map(c => ({
        type: 'competition',
        title: c.title,
        date: c.startDate,
        poster: c.poster,
        id: c._id,
      }))
    ];

    const sortedEvents = formattedEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 6);
    res.json(sortedEvents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
