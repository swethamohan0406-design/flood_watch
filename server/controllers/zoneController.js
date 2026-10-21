const Zone = require('../models/Zone');
const Station = require('../models/Station');

/**
 * @desc    Get all flood-prone zones
 * @route   GET /api/zones
 * @access  Private (All authenticated users)
 */
const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find()
      .populate('station', 'name riverName status currentWaterLevel warningLevel dangerLevel')
      .sort({ riskLevel: 1 });

    return res.status(200).json({
      success: true,
      count: zones.length,
      data: zones
    });
  } catch (error) {
    console.error('Error fetching zones:', error.message);
    return res.status(500).json({ message: 'Server error fetching zones', error: error.message });
  }
};

/**
 * @desc    Create a new flood-prone zone
 * @route   POST /api/zones
 * @access  Private (Admin only)
 */
const createZone = async (req, res) => {
  try {
    const { name, riskLevel, populationAtRisk, station } = req.body;

    if (!name || !riskLevel || !station) {
      return res.status(400).json({
        message: 'Please provide name, riskLevel (low/medium/high/critical), and station ID'
      });
    }

    const stationExists = await Station.findById(station);
    if (!stationExists) {
      return res.status(404).json({ message: 'Associated station not found' });
    }

    const zone = await Zone.create({
      name,
      riskLevel,
      populationAtRisk: Number(populationAtRisk || 0),
      station
    });

    return res.status(201).json({
      success: true,
      message: 'Flood zone created successfully',
      data: zone
    });
  } catch (error) {
    console.error('Error creating zone:', error.message);
    return res.status(500).json({ message: 'Server error creating zone', error: error.message });
  }
};

/**
 * @desc    Update a flood zone
 * @route   PUT /api/zones/:id
 * @access  Private (Admin only)
 */
const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    if (req.body.station) {
      const stationExists = await Station.findById(req.body.station);
      if (!stationExists) {
        return res.status(404).json({ message: 'Associated station not found' });
      }
    }

    const updatedZone = await Zone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('station', 'name riverName status');

    return res.status(200).json({
      success: true,
      message: 'Flood zone updated successfully',
      data: updatedZone
    });
  } catch (error) {
    console.error('Error updating zone:', error.message);
    return res.status(500).json({ message: 'Server error updating zone', error: error.message });
  }
};

/**
 * @desc    Delete a flood zone
 * @route   DELETE /api/zones/:id
 * @access  Private (Admin only)
 */
const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    await Zone.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Flood zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting zone:', error.message);
    return res.status(500).json({ message: 'Server error deleting zone', error: error.message });
  }
};

module.exports = {
  getAllZones,
  createZone,
  updateZone,
  deleteZone
};
