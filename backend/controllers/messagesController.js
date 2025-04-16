// backend/controllers/messagesController.js
const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.userId; // Assuming verifyToken sets req.userId

    const newMessage = new Message({ senderId, recipientId, message });
    await newMessage.save();
    res.json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const messages = await Message.find({ $or: [{ senderId: userId }, { recipientId: userId }] }).sort({ timestamp: 1 });
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: err.message });
  }
};