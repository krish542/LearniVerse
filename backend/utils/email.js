// backend/utils/email.js
const transporter = require('../transporter'); // Import the existing transporter

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Gmail'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}: ${options.subject}. Message ID: ${info.messageId} `);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
const sendApplicationUpdatedEmail = (email, fullName) => {
  const subject = 'Your Teacher Application Updated!';
  const html = `
      <p>Dear ${fullName},</p>
      <p>This is to confirm that you have successfully updated your teacher application.</p>
      <p>Your updated application is now under review.</p>
      <p>Best regards,<br>
      The [Your Platform Name] Team</p>
    `;

  sendEmail({
    email,
    subject,
    html,
  });
};

const sendApplicationSubmittedEmail = (email, fullName) => {
  const subject = 'Your Teacher Application Received!';
  const html = `
    <p>Dear ${fullName},</p>
    <p>Thank you for submitting your teacher application. We have received it successfully and it is currently under review.</p>
    <p>We will notify you once your application has been processed.</p>
    <p>Best regards,<br>
    The LearniVerse Team</p>
  `;
  sendEmail({
    email,
    subject,
    html,
  });
};
const sendApplicationApprovedEmail = (email, fullName) => {
  const subject = 'Your Teacher Application Approved!';
  const html = `
        <p>Dear ${fullName},</p>
        <p>Congratulations! Your teacher application has been approved. You are now a verified teacher on LearniVerse.</p>
        <p>You can now start teaching on our platform.</p>
        <p>Best regards,<br>The LearniVerse Team</p>
    `;

  sendEmail({
    email,
    subject,
    html,
  });
};

const sendApplicationRejectedEmail = (email, fullName) => {
  const subject = 'Your Teacher Application Rejected';
  const html = `
        <p>Dear ${fullName},</p>
        <p>We regret to inform you that your teacher application has been rejected.</p>
        <p>Thank you for your interest in teaching with LearniVerse.</p>
        <p>Best regards,<br>The LearniVerse Team</p>
    `;

  sendEmail({
    email,
    subject,
    html,
  });
};

const sendApplicationRevokedEmail = (email, fullName) => {
  const subject = 'Your Teacher Application Revoked';
  const html = `
        <p>Dear ${fullName},</p>
        <p>Your teacher application has been revoked and is now pending review again.</p>
        <p>Please contact admin for more details.</p>
        <p>Best regards,<br>The LearniVerse Team</p>
    `;

  sendEmail({
    email,
    subject,
    html,
  });
};

// Email for team member application submission
const sendTeamApplicationSubmittedEmail = (email, fullName) => {
  const subject = 'Your Team Member Application Received!';
  const html = `
    <p>Dear ${fullName},</p>
    <p>Thank you for submitting your team member application. We have received it successfully and it is currently under review.</p>
    <p>We will notify you once your application has been processed.</p>
    <p>Best regards,<br>
    The [Your Platform Name] Team</p>
  `;

  sendEmail({
    email,
    subject,
    html,
  });
};

// Email for team member application approval
const sendTeamApplicationApprovedEmail = (email, fullName) => {
  const subject = 'Your Team Member Application Approved!';
  const html = `
    <p>Dear ${fullName},</p>
    <p>Congratulations! Your team member application has been approved. You are now part of our team.</p>
    <p>We look forward to collaborating with you.</p>
    <p>Best regards,<br>The LearniVerse Team</p>
  `;

  sendEmail({
    email,
    subject,
    html,
  });
};

const sendTeamApplicationRevokedEmail = (email, fullName) => {
  const subject = 'Your Team Member Application Revoked';
  const html = `
    <p>Dear ${fullName},</p>
    <p>CYour team member application has been revoked. You are on hold for being part of the team.</p>
    <p>We look forward to collaborating with you.</p>
    <p>Best regards,<br>The LearniVerse Team</p>
  `;

  sendEmail({
    email,
    subject,
    html,
  });
};
// Email for team member application rejection
const sendTeamApplicationRejectedEmail = (email, fullName) => {
  const subject = 'Your Team Member Application Rejected';
  const html = `
    <p>Dear ${fullName},</p>
    <p>We regret to inform you that your team member application has been rejected.</p>
    <p>Thank you for your interest in joining our team.</p>
    <p>Best regards,<br>The LearniVerse Team</p>
  `;

  sendEmail({
    email,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendApplicationSubmittedEmail,
  sendApplicationUpdatedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendApplicationRevokedEmail,
  sendTeamApplicationSubmittedEmail,
  sendTeamApplicationApprovedEmail,
  sendTeamApplicationRejectedEmail,
  sendTeamApplicationRevokedEmail,
};
//
//
// module.exports = { sendEmail, sendApplicationSubmittedEmail, sendApplicationUpdatedEmail }