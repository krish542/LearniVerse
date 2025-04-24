const express = require('express');
const router = express.Router();
const {
  sendWorkshopProposal,
  respondToWorkshopProposal,
  updateWorkshopDetails,
  getAllWorkshops,
  getTeacherWorkshops,
} = require('../controllers/workshopController');

// Middlewares
const { verifyAdmin } = require('../middleware/adminAuthMiddleware');
const { requireTeacherAuth } = require('../middleware/authMiddleware');

// 🔒 Admin: send workshop proposal
router.post('/send-proposal',sendWorkshopProposal);
router.post('/send-proposal-test', async(req, res) => {
  console.log('Request received', req.body);
  res.json({received: true});
});

// 🔒 Admin: update final workshop details (after teacher accepts)
router.put('/update/:workshopId', verifyAdmin, updateWorkshopDetails);

// 🔒 Teacher: accept/reject proposal
router.put('/respond/:workshopId', requireTeacherAuth, respondToWorkshopProposal);

// 🔒 Admin: get all workshops
router.get('/all', getAllWorkshops);

// 🔒 Teacher: get own workshops
router.get('/my-workshops', requireTeacherAuth, getTeacherWorkshops);
router.get('/ping', (req, res) => {
  console.log('Ping received');
  res.json({ status: 'alive', timestamp: new Date() });
});
module.exports = router;