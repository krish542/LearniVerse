const Workshop = require('../models/Workshop');
const Teacher = require('../models/Teacher');
const { sendEmail } = require('../utils/email');

// Send workshop proposal to a teacher
exports.sendWorkshopProposal = async (req, res) => {
  //console.log('Starting workshop proposal...');
  try {
    //console.log('Request body:', req.body);
    const { teacherId, title, description, sampleOutline, suggestedByAdmin, adminId } = req.body;

    if (!req.body.teacherId || !req.body.title) return res.status(404).json({ message: 'TeacherId and title required' });
    //console.log('looking up teacher');
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({message: 'Teacher not found'});
    const formattedDates = suggestedByAdmin?.suggestedDates 
      ? suggestedByAdmin.suggestedDates.map(date => new Date(date))
      : [];
    
    //console.log('creating workshop document');
    const workshop = new Workshop({
      title,
      description,
      sampleOutline,
      adminId: adminId || req.user?._id,
      teacherId,
      suggestedByAdmin: {
        sessions: suggestedByAdmin?.sessions || 1,
        suggestedDates: formattedDates
      },
      status: 'pending',
    });
    //console.log('Workshop data prepared:', workshop);
    const savedWorkshop = await workshop.save();
    //console.log('Workshop saved:', savedWorkshop);
    try {
      // Format dates for email display
      const displayDates = savedWorkshop.suggestedByAdmin.suggestedDates
        .map(date => date.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
        .join('<br>');

      await sendEmail({
        email: teacher.email,
        subject: `Workshop Proposal: ${title}`,
        html: `
          <p>Dear ${teacher.fullName},</p>
          <p>You have received a new workshop proposal:</p>
          <h3>${title}</h3>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Outline:</strong>${sampleOutline}</p>
          <p><strong>Proposed Dates:</strong><br>${displayDates || 'To be determined'}</p>
          <p>Please log in to your dashboard to accept or decline this proposal.</p>
          <p>Best regards,<br>LearniVerse Team</p>
        `
      });
      //console.log('Email sent successfully');
    } catch(emailErr) {
      //console.error('Email sending failed:', emailErr);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      message: 'workshop created and proposal sent successfully',
      workshop: savedWorkshop
    })
    //res.status(200).json({ message: 'Workshop proposal sent successfully', workshop });
  } catch (error) {
    console.error('Send proposal error:', error);
    res.status(500).json({ message: 'Failed to send proposal' });
  }
};
exports.resendWorkshopEmail = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.workshopId)
      .populate('teacherId', 'email fullName');
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    await sendEmail({
      email: workshop.teacherId.email,
      subject: `Reminder: Workshop Proposal - ${workshop.title}`,
      html: `
        <p>Dear ${workshop.teacherId.fullName},</p>
        <p>This is a reminder about the pending workshop proposal:</p>
        <h3>${workshop.title}</h3>
        <p>Please log in to your dashboard to respond to this proposal.</p>
        <p>Proposed Dates: ${workshop.suggestedByAdmin.suggestedDates.map(d => new Date(d).toLocaleString()).join(', ')}</p>
        <p>— LearniVerse Admin Team</p>
      `
    });

    res.json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({ message: 'Failed to send reminder email' });
  }
};
// Teacher responds to a workshop proposal
exports.respondToWorkshopProposal = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { response } = req.body; // 'accepted' or 'rejected'

    const workshop = await Workshop.findById(workshopId).populate('teacher');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    if (workshop.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    workshop.status = response;
    await workshop.save();

    // Optional: notify admin via email or system log
    await sendEmail({
      email: workshop.adminId.email,
      subject: `Workshop ${response} by teacher`,
      html: `Teacher has ${response} the workshop "${workshop.title}"`
    });
    res.status(200).json({ message: `Workshop ${response} successfully`, workshop });
  } catch (error) {
    console.error('Response error:', error);
    res.status(500).json({ message: 'Failed to respond to workshop' });
  }
};

// Update workshop details after teacher approval (outline upload, final scheduling)
exports.updateWorkshopDetails = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { finalDate, outlineLink } = req.body;

    const workshop = await Workshop.findById(workshopId);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    workshop.finalDate = finalDate;
    workshop.outlineLink = outlineLink;
    workshop.status = 'scheduled';

    await workshop.save();
    res.status(200).json({ message: 'Workshop updated and scheduled', workshop });
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ message: 'Failed to update workshop' });
  }
};

// Get all workshops (admin use)
exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find().populate({path: 'teacherId', select: 'fullName email subjectsCanTeach', model: 'Teacher'});
    res.status(200).json({ workshops });
  } catch (error) {
    console.error('Fetch all workshops error:', error);
    res.status(500).json({ message: 'Failed to fetch workshops' });
  }
};

// Get teacher's workshops (teacher use)
exports.getTeacherWorkshops = async (req, res) => {
  try {
    console.log('Fetching workshops for teacher: ', req.user._id);
    const workshops = await Workshop.find({ teacherId: req.user._id })
    .populate('adminId', 'name email')
    .populate('teacherId', 'fullName email');
    console.log('Found workshops:', workshops);
    res.status(200).json({ workshops });
  } catch (error) {
    console.error('Fetch teacher workshops error:', error);
    res.status(500).json({ message: 'Failed to fetch workshops' });
  }
};

// Teacher accepts workshop with details
exports.acceptWorkshopWithDetails = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { suggestedSessions, suggestedDates, feedback } = req.body;

    const workshop = await Workshop.findById(workshopId)
      .populate('teacherId', 'email fullName')
      .populate('adminId', 'email name');

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.teacherId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update workshop with teacher's suggestions
    workshop.suggestedByTeacher = {
      sessions: suggestedSessions,
      suggestedDates: suggestedDates.map(date => new Date(date))
    };
    workshop.feedback = feedback;
    workshop.status = 'accepted';
    
    await workshop.save();

    // Send email to admin
    await sendEmail({
      email: workshop.adminId.email,
      subject: `Workshop Accepted: ${workshop.title}`,
      html: `
        <p>Dear Admin,</p>
        <p>Teacher ${workshop.teacherId.fullName} has accepted the workshop "${workshop.title}" with the following details:</p>
        <p><strong>Suggested Sessions:</strong> ${suggestedSessions}</p>
        <p><strong>Suggested Dates:</strong><br>
          ${suggestedDates.map(d => new Date(d).toLocaleString()).join('<br>')}
        </p>
        <p><strong>Teacher's Notes:</strong> ${feedback || 'None'}</p>
        <p>Please log in to finalize the workshop details.</p>
        <p>Best regards,<br>LearniVerse Team</p>
      `
    });

    res.status(200).json({ message: 'Workshop accepted successfully', workshop });
  } catch (error) {
    console.error('Accept workshop error:', error);
    res.status(500).json({ message: 'Failed to accept workshop' });
  }
};
exports.finalizeWorkshop = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { totalSessions, confirmedDates, meetLinks, finalOutline } = req.body;
    
    // Handle file upload
    let posterUrl = '';
    if (req.file) {
      posterUrl = `/uploads/posters/${req.file.filename}`;
    }

    const workshop = await Workshop.findById(workshopId)
      .populate('teacherId', 'email fullName')
      .populate('adminId', 'email name');

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    // Update workshop
    workshop.final = {
      totalSessions,
      confirmedDates: confirmedDates.map(date => new Date(date)),
      meetLinks: Array.isArray(meetLinks) ? meetLinks : [meetLinks]
    };
    workshop.finalOutline = finalOutline;
    workshop.posterUrl = posterUrl;
    workshop.status = 'finalized';
    
    await workshop.save();

    // Send email to teacher
    await sendEmail({
      email: workshop.teacherId.email,
      subject: `Workshop Finalized: ${workshop.title}`,
      html: `
        <p>Dear ${workshop.teacherId.fullName},</p>
        <p>Your workshop "${workshop.title}" has been finalized with the following details:</p>
        <p><strong>Sessions:</strong> ${totalSessions}</p>
        <p><strong>Dates:</strong><br>
          ${confirmedDates.map(d => new Date(d).toLocaleString()).join('<br>')}
        </p>
        <p><strong>Meet Links:</strong><br>
          ${meetLinks.map((link, i) => `<a href="${link}">Session ${i+1}</a>`).join('<br>')}
        </p>
        ${posterUrl ? `<p><strong>Poster:</strong> <img src="${posterUrl}" alt="Workshop Poster" style="max-width: 100%;"></p>` : ''}
        <p>Please review the details and prepare for your workshop.</p>
        <p>Best regards,<br>${workshop.adminId.name}</p>
      `
    });

    res.status(200).json({ 
      message: 'Workshop finalized successfully', 
      workshop 
    });
  } catch (error) {
    console.error('Finalize workshop error:', error);
    res.status(500).json({ message: 'Failed to finalize workshop' });
  }
};