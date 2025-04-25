const express = require('express');
const router = express.Router();
const {
  sendWorkshopProposal,
  respondToWorkshopProposal,
  updateWorkshopDetails,
  getAllWorkshops,
  getTeacherWorkshops,
  resendWorkshopEmail,
  acceptWorkshopWithDetails,
  finalizeWorkshop,
} = require('../controllers/workshopController');
const upload = require('../middleware/uploadMiddleware');
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
router.put('/accept/:workshopId', requireTeacherAuth, acceptWorkshopWithDetails);
// 🔒 Teacher: accept/reject proposal
router.put('/respond/:workshopId', requireTeacherAuth, respondToWorkshopProposal);
router.put('/finalize/:workshopId', upload.single('poster'), (req,res,next)=>{
  console.log('upload middleware passed, proceeding to controller'); next(); 
}, finalizeWorkshop);
// 🔒 Admin: get all workshops
router.get('/all', getAllWorkshops);
router.post('/resend-email/:workshopId', resendWorkshopEmail);
// 🔒 Teacher: get own workshops
router.get('/my-workshops', requireTeacherAuth, getTeacherWorkshops);
router.get('/ping', (req, res) => {
  console.log('Ping received');
  res.json({ status: 'alive', timestamp: new Date() });
});
module.exports = router;