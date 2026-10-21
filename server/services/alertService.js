const Station = require('../models/Station');
const Alert = require('../models/Alert');

/**
 * Evaluates water level against warning and danger thresholds.
 * Updates the station status and current metrics.
 * Automatically generates an active alert if threshold is breached and no active alert of that severity exists.
 *
 * @param {string|ObjectId} stationId - ID of the monitoring station
 * @param {number} waterLevel - Latest water level in meters
 * @param {number} rainfall - Latest rainfall in mm
 * @returns {Promise<{ station: Object, alert: Object|null }>}
 */
const evaluateReadingAndAlerts = async (stationId, waterLevel, rainfall) => {
  const station = await Station.findById(stationId);
  if (!station) {
    throw new Error('Station not found');
  }

  // 1. Determine status based on thresholds
  let newStatus = 'normal';
  if (waterLevel >= station.dangerLevel) {
    newStatus = 'danger';
  } else if (waterLevel >= station.warningLevel) {
    newStatus = 'warning';
  }

  // 2. Update station's current readings and status
  station.currentWaterLevel = waterLevel;
  station.currentRainfall = rainfall !== undefined ? rainfall : station.currentRainfall;
  station.status = newStatus;
  await station.save();

  let createdAlert = null;

  // 3. Check if warning or danger alert should be triggered
  if (newStatus === 'warning' || newStatus === 'danger') {
    // Check if an active alert for this station with this severity already exists
    const existingActiveAlert = await Alert.findOne({
      stationId: station._id,
      severity: newStatus,
      status: 'active'
    });

    // Only create alert if one does not already actively exist
    if (!existingActiveAlert) {
      const alertMessage =
        newStatus === 'danger'
          ? `CRITICAL DANGER: Water level at ${station.name} on ${station.riverName} reached ${waterLevel}m (Danger threshold: ${station.dangerLevel}m). Urgent action required!`
          : `WARNING: Water level at ${station.name} on ${station.riverName} reached ${waterLevel}m (Warning threshold: ${station.warningLevel}m). Flood monitoring advised.`;

      createdAlert = await Alert.create({
        stationId: station._id,
        severity: newStatus,
        message: alertMessage,
        status: 'active',
        createdAt: new Date()
      });
    }
  }

  return { station, alert: createdAlert };
};

module.exports = {
  evaluateReadingAndAlerts
};
