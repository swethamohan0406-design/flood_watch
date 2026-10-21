const Reading = require('../models/Reading');
const Station = require('../models/Station');
const { evaluateReadingAndAlerts } = require('../services/alertService');

/**
 * @desc    Add a new water level / rainfall reading for a station
 * @route   POST /api/readings
 * @access  Private (Admin & Observer)
 */
const addReading = async (req, res) => {
  try {
    const { stationId, waterLevel, rainfall, recordedAt } = req.body;

    if (!stationId || waterLevel === undefined) {
      return res.status(400).json({
        message: 'Please provide stationId and waterLevel'
      });
    }

    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    const numWater = Number(waterLevel);
    const numRainfall = Number(rainfall !== undefined ? rainfall : 0);

    // Create the time-series reading record
    const reading = await Reading.create({
      stationId,
      waterLevel: numWater,
      rainfall: numRainfall,
      recordedAt: recordedAt || new Date()
    });

    // Evaluate thresholds, update station stats, and generate alerts if necessary
    const { station: updatedStation, alert } = await evaluateReadingAndAlerts(
      stationId,
      numWater,
      numRainfall
    );

    return res.status(201).json({
      success: true,
      message: 'Reading added and station status updated successfully',
      data: {
        reading,
        stationStatus: updatedStation.status,
        currentWaterLevel: updatedStation.currentWaterLevel,
        currentRainfall: updatedStation.currentRainfall,
        triggeredAlert: alert
      }
    });
  } catch (error) {
    console.error('Error adding reading:', error.message);
    return res.status(500).json({ message: 'Server error adding reading', error: error.message });
  }
};

/**
 * @desc    Get historical readings for a specific station (oldest to newest)
 * @route   GET /api/readings/station/:id
 * @access  Private (All authenticated users)
 */
const getReadingsByStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await Station.findById(id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Sort by recordedAt ascending (oldest to newest)
    const readings = await Reading.find({ stationId: id }).sort({ recordedAt: 1 });

    return res.status(200).json({
      success: true,
      count: readings.length,
      station: {
        _id: station._id,
        name: station.name,
        riverName: station.riverName,
        warningLevel: station.warningLevel,
        dangerLevel: station.dangerLevel
      },
      data: readings
    });
  } catch (error) {
    console.error('Error fetching readings:', error.message);
    return res.status(500).json({ message: 'Server error fetching readings', error: error.message });
  }
};

module.exports = {
  addReading,
  getReadingsByStation
};
