const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jwt = require('jsonwebtoken');
const userManagementController = require('../controllers/userManagementController');
const { adminAuthMiddleware, verifyAdmin } = require('../middleware/adminAuthMiddleware');
const statsController = require('../controllers/statsController');
const verifyMainAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;

        if (decoded.role !== 'main') {
            return res.status(403).json({ message: 'Access denied. Main admin only' });
        }
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

router.post('/login', adminController.adminLogin);
router.post('/first', adminController.createFirstAdmin);
router.post('/', verifyMainAdmin, adminController.createAdmin);
router.get('/', verifyMainAdmin, adminController.getAllAdmins);
router.put('/:id', verifyMainAdmin, adminController.updateAdmin);
router.delete('/:id', verifyMainAdmin, adminController.deleteAdmin);

router.get('/teacher-applications', adminAuthMiddleware, userManagementController.getAllTeacherApplications);
router.patch('/teacher-applications/:id/status', adminAuthMiddleware, userManagementController.updateTeacherApplicationStatus);

router.get('/teachers', verifyAdmin('manageTeachers'), userManagementController.getAllTeachers);
router.post('/teachers/:userId/approve', verifyAdmin('manageTeachers'), userManagementController.approveTeacher);
router.post('/teachers/:userId/reject', verifyAdmin('manageTeachers'), userManagementController.rejectTeacher);
router.delete('/teachers/:userId', verifyAdmin('manageTeachers'), userManagementController.deleteTeacher);
router.get('/user-stats', adminAuthMiddleware, statsController.getUserStats);
router.get('/report-stats', adminAuthMiddleware, statsController.getReportStats);
router.get('/approval-stats', adminAuthMiddleware, statsController.getApprovalStats);
router.get('/user-growth', adminAuthMiddleware, adminController.getUserGrowthStats);
//router.get('/stats', getAdminStats);
module.exports = router;