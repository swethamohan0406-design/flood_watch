const mongoose = require('mongoose');

/**
 * Reading Model
 * Stores time-series hydrometric measurements (water level and rainfall)
 * recorded at specific monitoring stations.
 */
const readingSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required']
    },
    waterLevel: {
      type: Number,
      required: [true, 'Water level measurement (in meters) is required']
    },
    rainfall: {
      type: Number,
      required: [true, 'Rainfall measurement (in mm) is required'],
      default: 0
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reading', readingSchema);
