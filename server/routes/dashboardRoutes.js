const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard summary requires authentication
router.get('/summary', protect, getDashboardSummary);

module.exports = router;
