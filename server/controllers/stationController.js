const Station = require('../models/Station');

/**
 * @desc    Get all monitoring stations
 * @route   GET /api/stations
 * @access  Private (All authenticated users)
 */
const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (error) {
    console.error('Error fetching stations:', error.message);
    return res.status(500).json({ message: 'Server error fetching stations', error: error.message });
  }
};

/**
 * @desc    Get single station by ID
 * @route   GET /api/stations/:id
 * @access  Private (All authenticated users)
 */
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    return res.status(200).json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error('Error fetching station:', error.message);
    return res.status(500).json({ message: 'Server error fetching station', error: error.message });
  }
};

/**
 * @desc    Create a new station
 * @route   POST /api/stations
 * @access  Private (Admin only)
 */
const createStation = async (req, res) => {
  try {
    const {
      name,
      riverName,
      location,
      warningLevel,
      dangerLevel,
      currentWaterLevel,
      currentRainfall,
      status
    } = req.body;

    if (!name || !riverName || !location || !location.lat || !location.lng || warningLevel === undefined || dangerLevel === undefined) {
      return res.status(400).json({
        message: 'Please provide name, riverName, location {lat, lng}, warningLevel, and dangerLevel'
      });
    }

    // Determine initial status if currentWaterLevel is supplied
    let initialStatus = status || 'normal';
    const water = Number(currentWaterLevel || 0);
    if (water >= Number(dangerLevel)) {
      initialStatus = 'danger';
    } else if (water >= Number(warningLevel)) {
      initialStatus = 'warning';
    }

    const station = await Station.create({
      name,
      riverName,
      location,
      warningLevel,
      dangerLevel,
      currentWaterLevel: water,
      currentRainfall: Number(currentRainfall || 0),
      status: initialStatus
    });

    return res.status(201).json({
      success: true,
      message: 'Station created successfully',
      data: station
    });
  } catch (error) {
    console.error('Error creating station:', error.message);
    return res.status(500).json({ message: 'Server error creating station', error: error.message });
  }
};

/**
 * @desc    Update station details
 * @route   PUT /api/stations/:id
 * @access  Private (Admin only)
 */
const updateStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    const updatedStation = await Station.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Station updated successfully',
      data: updatedStation
    });
  } catch (error) {
    console.error('Error updating station:', error.message);
    return res.status(500).json({ message: 'Server error updating station', error: error.message });
  }
};

/**
 * @desc    Delete a station
 * @route   DELETE /api/stations/:id
 * @access  Private (Admin only)
 */
const deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    await Station.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting station:', error.message);
    return res.status(500).json({ message: 'Server error deleting station', error: error.message });
  }
};

module.exports = {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation
};
