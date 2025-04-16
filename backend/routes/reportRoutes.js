const express = require("express");
const router = express.Router();
const {verifyTeamMember} = require('../middleware/teamAuth');
const { submitReport, getAllReports, sendReportResponse } = require("../controllers/reportController");

router.post("/", submitReport);
router.get("/", getAllReports);
router.post('/respond/:id', verifyTeamMember, sendReportResponse);

module.exports = router;
