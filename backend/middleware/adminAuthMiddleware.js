const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuthMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = await Admin.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('Admin Auth Error:', error);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const verifyAdmin = (permission) => {
    console.log('admin auth started');
    return (req, res, next) => {
        if (req.admin) {
            // Replace this with your actual permission checking logic
            // For example, you might have a 'roles' array or a 'permissions' object in your Admin model
            // and you would check if the required 'permission' is present.
            // This is a placeholder and needs to be implemented based on your admin role/permission system.
            const adminHasPermission = true; // Replace with actual check

            if (adminHasPermission) {
                next();
                console.log('admin auth completed');
            } else {
                return res.status(403).json({ message: 'Not authorized to perform this action' });
            }
        } else {
            return res.status(401).json({ message: 'Not authorized' });
        }
    };
};

module.exports = { adminAuthMiddleware, verifyAdmin };