// backend/controllers/eventController.js
const Workshop = require('../models/Workshop');
const Competition = require('../models/Competition');

exports.getAllEvents = async (req, res) => {
    try {
      const { type, date, sortBy, page = 1, limit = 10 } = req.query;
  
      const query = {};
  
      // Filter by date (applies to both)
      if (date) {
        query.date = { $gte: new Date(date) };
      }
  
      let sortOptions = {};
      if (sortBy === 'date') {
        sortOptions = { date: 1 };
      } else if (sortBy === 'trending') {
        sortOptions = { createdAt: -1 };
      }
  
      // Fetch based on 'type' param
      let workshops = [];
      let competitions = [];
  
      if (!type || type === 'workshop') {
        workshops = await Workshop.find(query).sort(sortOptions).skip((page - 1) * limit).limit(Number(limit));
      }
      if (!type || type === 'competition') {
        competitions = await Competition.find(query).sort(sortOptions).skip((page - 1) * limit).limit(Number(limit));
      }
  
      const formattedWorkshops = workshops.map(w => ({ ...w._doc, type: 'workshop' }));
      const formattedCompetitions = competitions.map(c => ({ ...c._doc, type: 'competition' }));
  
      const events = [...formattedWorkshops, ...formattedCompetitions];
  
      res.status(200).json(events);
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  