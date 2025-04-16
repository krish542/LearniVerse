const Teacher = require('../models/Teacher');
const { sendEmail } = require('../utils/email');

const userManagementController = {
    // Get all teacher applications, filterable by status
    getAllTeacherApplications: async (req, res) => {
        try {
            const applications = await Teacher.find({
                applicationStatus: { $in: ['submitted', 'pending', 'accepted', 'rejected'] }
            }).select('fullName email applicationStatus certifications degreeCertificates subjectsCanTeach levelsCanTeach languagesCanTeachIn previousPlatforms isVerified institutions city country dateOfBirth gender highestQualification idProof phoneNumber teachingExperienceYears'); // Select only necessary fields

            const submittedApplications = applications.filter(app => app.applicationStatus === 'submitted' || app.applicationStatus === 'pending');
            const approvedTeachers = applications.filter(app => app.applicationStatus === 'accepted');
            const rejectedTeachers = applications.filter(app => app.applicationStatus === 'rejected');

            res.status(200).json({ submittedApplications, approvedTeachers, rejectedTeachers });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch teacher applications' });
        }
    },

    // Update the application status (approve, reject, revoke)
    updateTeacherApplicationStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body; // status: 'accepted', 'rejected', 'submitted'

        try {
            const teacher = await Teacher.findByIdAndUpdate(id, { applicationStatus: status }, { new: true }).select('fullName email'); // Get name and email for email sending

            if (!teacher) {
                return res.status(404).json({ message: 'Teacher application not found' });
            }

            let emailSubject = '';
            let emailBody = '';

            switch (status) {
                case 'accepted':
                    emailSubject = 'Your Teacher Application Approved!';
                    emailBody = `
                        <p>Dear ${teacher.fullName},</p>
                        <p>Congratulations! Your teacher application has been approved. You are now a verified teacher on LearniVerse.</p>
                        <p>You can now start teaching on our platform.</p>
                        <p>Best regards,<br>The LearniVerse Team</p>
                    `;
                    break;
                case 'rejected':
                    emailSubject = 'Your Teacher Application Rejected';
                    emailBody = `
                        <p>Dear ${teacher.fullName},</p>
                        <p>We regret to inform you that your teacher application has been rejected.</p>
                        <p>Thank you for your interest in teaching with LearniVerse.</p>
                        <p>Best regards,<br>The LearniVerse Team</p>
                    `;
                    break;
                case 'submitted': // Revoked
                    emailSubject = 'Your Teacher Application Revoked';
                    emailBody = `
                        <p>Dear ${teacher.fullName},</p>
                        <p>Your teacher application has been revoked and is now pending review again.</p>
                        <p>Please contact admin for more details.</p>
                        <p>Best regards,<br>The LearniVerse Team</p>
                    `;
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid application status' });
            }

            // Send email
            await sendEmail({
                email: teacher.email,
                subject: emailSubject,
                html: emailBody,
            });

            res.status(200).json({ message: 'Application status updated', teacher });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to update application status' });
        }
    },

    // Get all approved teachers
    getAllTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find({ applicationStatus: 'accepted' }).select('fullName email applicationStatus certifications degreeCertificates subjectsCanTeach levelsCanTeach languagesCanTeachIn previousPlatforms isVerified institutions city country dateOfBirth gender highestQualification idProof phoneNumber teachingExperienceYears');
            /*
            fullName email applicationStatus certifications degreeCertificates subjectsCanTeach levelsCanTeach languagesCanTeachIn previousPlatforms isVerified institutions city country dateOfBirth gender highestQualification idProof phoneNumber teachingExperienceYears

            */
            res.status(200).json(teachers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch approved teachers' });
        }
    },

    // Approve a teacher (alternative to updateStatus, kept for clarity if needed)
    approveTeacher: async (req, res) => {
        const { userId } = req.params;
        try {
            const teacher = await Teacher.findByIdAndUpdate(userId, { applicationStatus: 'accepted' }, { new: true }).select('fullName email');
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }

            // Send approval email (using existing sendEmail function)
            const emailSubject = 'Your Teacher Application Approved!';
            const emailBody = `
                <p>Dear ${teacher.fullName},</p>
                <p>Congratulations! Your teacher application has been approved. You are now a verified teacher on LearniVerse.</p>
                <p>You can now start teaching on our platform.</p>
                <p>Best regards,<br>The LearniVerse Team</p>
            `;

            await sendEmail({
                email: teacher.email,
                subject: emailSubject,
                html: emailBody,
            });

            res.status(200).json({ message: 'Teacher approved', teacher });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to approve teacher' });
        }
    },

    // Reject a teacher (alternative to updateStatus, kept for clarity if needed)
    rejectTeacher: async (req, res) => {
        const { userId } = req.params;
        try {
            const teacher = await Teacher.findByIdAndUpdate(userId, { applicationStatus: 'rejected' }, { new: true }).select('fullName email');
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            // Send rejection email (using existing sendEmail function)
            const emailSubject = 'Your Teacher Application Rejected';
            const emailBody = `
                <p>Dear ${teacher.fullName},</p>
                <p>We regret to inform you that your teacher application has been rejected.</p>
                <p>Thank you for your interest in teaching with LearniVerse.</p>
                <p>Best regards,<br>The LearniVerse Team</p>
            `;

            await sendEmail({
                email: teacher.email,
                subject: emailSubject,
                html: emailBody,
            });

            res.status(200).json({ message: 'Teacher rejected', teacher });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to reject teacher' });
        }
    },

    // Delete a teacher (this might be different from "reject" depending on your needs)
    deleteTeacher: async (req, res) => {
        const { userId } = req.params;
        try {
            const teacher = await Teacher.findByIdAndDelete(userId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            res.status(200).json({ message: 'Teacher deleted' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete teacher' });
        }
    }
};

module.exports = userManagementController;