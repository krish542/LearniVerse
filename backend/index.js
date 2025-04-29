// backend/index.js
// Enable strict error handling
require('dotenv').config();
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => process.exit(1));
});

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
const cors = require('cors');
app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, x-auth-token',
}));
app.use(express.json());
app.use(express.json({extended: false}));
const path = require('path');

const auth = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacherRoutes');
const multer = require('multer');
const courseRoutes = require('./routes/courseRoutes');
const teamRoutes = require('./routes/teamRoutes');
const reportRoutes = require('./routes/reportRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const apiRoutes = require('./routes/api')
const eventRoutes = require('./routes/eventRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const cartRoutes = require('./routes/cartRoutes');
//import liveSessionRoutes from './routes/liveSessionRoutes.js';
const liveSessionRoutes = require('./routes/liveSessionRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const PORT = process.env.PORT || 5000;
const storage = multer.memoryStorage(); // Store files in memory (adjust as needed)
const upload = multer({ storage: storage });

const { Server } = require('socket.io');
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', auth);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', teacherRoutes);
app.use('/api', courseRoutes);
app.use('/api', apiRoutes);
app.use('/api', eventRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/team', teamRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/api/live-sessions', liveSessionRoutes);
app.get('/api/avatar/:userId', (req, res) => {
  const { userId } = req.params;
  // In a real application, fetch this data from your database
  const avatarConfig = {
    legs: 'default_legs',
    body: 'default_body',
    head: 'default_head',
  };
  res.json(avatarConfig);
});
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});
const connectedUsers = {};

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});
app.use((err, req, res, next) => {
  console.error('💥 Global Error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
app.use((err, req, res, next) => {
  
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    return res.status(400).json({ error: err.message });
  } else if (err) {
    console.error("Unknown error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('LearniVerse Backend');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  console.error("General server error: ", err);
  res.status(500).json({ message: 'Something broke!' });
});
// Other routes (recommend, featuredCourses, upcomingEvents) remain unchanged...



server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running with socket.io on http://localhost:${PORT}`);
});


io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);
  socket.on('join-game', ({ userId, avatarParts }) => {
    // Assign default position
    connectedUsers[socket.id] = {
      userId,
      x: 400,
      y: 300,
      avatarParts
    };

    // Inform the new user of all existing avatars
    socket.emit('all-avatars', connectedUsers);

    // Notify others of new user
    socket.broadcast.emit('new-avatar', {
      socketId: socket.id,
      ...connectedUsers[socket.id]
    });
  });

  socket.on('playerData', (playerInfo) => {
    //broadcast to others
    socket.broadcast.emit('newPlayer', {id: socket.id, ...playerInfo});
  });
  socket.on('playerMoved', (data) => {
    socket.broadcast.emit('playerMoved', {id: socket.id, ...data});
  });
  socket.on('move-avatar', ({ x, y }) => {
    if (connectedUsers[socket.id]) {
      connectedUsers[socket.id].x = x;
      connectedUsers[socket.id].y = y;

      socket.broadcast.emit('update-avatar', {
        socketId: socket.id,
        x,
        y
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete connectedUsers[socket.id];
    io.emit('remove-avatar', socket.id);
  });

});
console.log('=== ENVIRONMENT VARIABLES ===');
console.log({
  MONGO_URI: process.env.MONGO_URI ? '*****' : 'MISSING',
  JWT_SECRET: process.env.JWT_SECRET ? '*****' : 'MISSING',
  PORT: process.env.PORT
});