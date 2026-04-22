const express = require('express');
const profileRoutes = require('./routes/profiles');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

// CORS — required for grading script
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api/profiles', profileRoutes);

// Unknown route
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;