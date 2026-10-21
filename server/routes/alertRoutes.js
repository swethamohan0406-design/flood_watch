const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  getActiveAlerts,
  resolveAlert
} = require('../controllers/alertController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All alert routes require authentication
router.use(protect);

router.get('/', getAllAlerts);
router.get('/active', getActiveAlerts);
router.patch('/:id/resolve', restrictTo('admin'), resolveAlert);

module.exports = router;
