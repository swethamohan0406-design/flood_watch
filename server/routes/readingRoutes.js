const express = require('express');
const router = express.Router();
const { addReading, getReadingsByStation } = require('../controllers/readingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All reading routes require authentication
router.use(protect);

// Add reading: allowed for both admin and observer roles
router.post('/', restrictTo('admin', 'observer'), addReading);

// Get readings history for a station (oldest to newest): allowed for all logged-in users
router.get('/station/:id', getReadingsByStation);

module.exports = router;
