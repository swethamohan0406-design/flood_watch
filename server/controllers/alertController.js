const Alert = require('../models/Alert');

/**
 * @desc    Get all alerts (history and active, newest first)
 * @route   GET /api/alerts
 * @access  Private (All authenticated users)
 */
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('stationId', 'name riverName status currentWaterLevel warningLevel dangerLevel')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    return res.status(500).json({ message: 'Server error fetching alerts', error: error.message });
  }
};

/**
 * @desc    Get only active alerts
 * @route   GET /api/alerts/active
 * @access  Private (All authenticated users)
 */
const getActiveAlerts = async (req, res) => {
  try {
    const activeAlerts = await Alert.find({ status: 'active' })
      .populate('stationId', 'name riverName status currentWaterLevel warningLevel dangerLevel')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: activeAlerts.length,
      data: activeAlerts
    });
  } catch (error) {
    console.error('Error fetching active alerts:', error.message);
    return res.status(500).json({ message: 'Server error fetching active alerts', error: error.message });
  }
};

/**
 * @desc    Resolve an active alert
 * @route   PATCH /api/alerts/:id/resolve
 * @access  Private (Admin only)
 */
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({ message: 'Alert is already resolved' });
    }

    alert.status = 'resolved';
    await alert.save();

    return res.status(200).json({
      success: true,
      message: 'Alert marked as resolved',
      data: alert
    });
  } catch (error) {
    console.error('Error resolving alert:', error.message);
    return res.status(500).json({ message: 'Server error resolving alert', error: error.message });
  }
};

module.exports = {
  getAllAlerts,
  getActiveAlerts,
  resolveAlert
};
