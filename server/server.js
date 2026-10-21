const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const readingRoutes = require('./routes/readingRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize Express application
const app = express();

// Connect to MongoDB database
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());

// API Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Flood Monitoring API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount application routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Start Express HTTP server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Flood Monitoring Server running on port ${PORT}`);
});
