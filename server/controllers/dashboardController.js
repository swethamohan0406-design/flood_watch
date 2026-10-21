const Station = require('../models/Station');
const Alert = require('../models/Alert');
const Reading = require('../models/Reading');

/**
 * @desc    Get system-wide summary metrics for dashboard
 * @route   GET /api/dashboard/summary
 * @access  Private (All authenticated users)
 */
const getDashboardSummary = async (req, res) => {
  try {
    // 1. Total number of stations
    const totalStations = await Station.countDocuments();

    // 2. Total active alerts
    const activeAlerts = await Alert.countDocuments({ status: 'active' });

    // 3. Number of stations currently in danger status
    const stationsInDanger = await Station.countDocuments({ status: 'danger' });

    // 4. Highest rainfall currently recorded
    const highestStation = await Station.findOne().sort({ currentRainfall: -1 });
    const highestReading = await Reading.findOne().sort({ rainfall: -1 });

    const highestStationRain = highestStation ? highestStation.currentRainfall : 0;
    const highestReadingRain = highestReading ? highestReading.rainfall : 0;
    const highestRainfall = Math.max(highestStationRain, highestReadingRain);

    const summary = {
      totalStations,
      activeAlerts,
      stationsInDanger,
      highestRainfall
    };

    return res.status(200).json({
      success: true,
      ...summary,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error.message);
    return res.status(500).json({
      message: 'Server error fetching dashboard summary',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardSummary
};
