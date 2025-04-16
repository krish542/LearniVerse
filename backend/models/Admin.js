const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['main', 'sub'], default: 'sub' }, // Main admin or sub-admin
  permissions: {
    manageAdmins: { type: Boolean, default: false }, // Only main admin can manage other admins
    manageTeachers: { type: Boolean, default: true }, // Sub-admins can manage teachers
    manageStudents: { type: Boolean, default: true }, // Sub-admins can manage students
  },
});

module.exports = mongoose.model('Admin', adminSchema);