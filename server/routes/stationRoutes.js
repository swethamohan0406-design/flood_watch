const express = require('express');
const router = express.Router();
const {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation
} = require('../controllers/stationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All station routes require valid JWT authentication
router.use(protect);

router
  .route('/')
  .get(getAllStations)
  .post(restrictTo('admin'), createStation);

router
  .route('/:id')
  .get(getStationById)
  .put(restrictTo('admin'), updateStation)
  .delete(restrictTo('admin'), deleteStation);

module.exports = router;
