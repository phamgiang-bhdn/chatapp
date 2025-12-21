const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const { Op } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[AUTH] ${req.method} ${req.url}`);
  next();
});

app.use('/', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service is running' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Using migration-managed database schema.');

    app.listen(PORT, () => {
      console.log(`Auth Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

global.Op = Op;
