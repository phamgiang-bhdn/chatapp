const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/database');
const chatRoutes = require('./routes/chat');
const socketHandler = require('./socket/socketHandler');
const { startScheduler } = require('./scheduler/messageScheduler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:9000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3003;

app.use((req, res, next) => {
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`[CHAT] ${req.method} ${req.url}`);
  next();
});

app.use('/', chatRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Chat Service is running' });
});

socketHandler(io);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Using migration-managed database schema.');

    // Start scheduled message scheduler
    startScheduler();

    server.listen(PORT, () => {
      console.log(`Chat Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
