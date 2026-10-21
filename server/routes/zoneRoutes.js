const express = require('express');
const router = express.Router();
const {
  getAllZones,
  createZone,
  updateZone,
  deleteZone
} = require('../controllers/zoneController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All zone routes require authentication
router.use(protect);

router
  .route('/')
  .get(getAllZones)
  .post(restrictTo('admin'), createZone);

router
  .route('/:id')
  .put(restrictTo('admin'), updateZone)
  .delete(restrictTo('admin'), deleteZone);

module.exports = router;
