const mongoose = require('mongoose');

/**
 * Station Model
 * Represents a river monitoring station with geographical coordinates,
 * flood threshold levels (warning and danger), and real-time status.
 */
const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true
    },
    riverName: {
      type: String,
      required: [true, 'River name is required'],
      trim: true
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required']
      }
    },
    warningLevel: {
      type: Number,
      required: [true, 'Warning level threshold (in meters) is required']
    },
    dangerLevel: {
      type: Number,
      required: [true, 'Danger level threshold (in meters) is required']
    },
    currentWaterLevel: {
      type: Number,
      default: 0
    },
    currentRainfall: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['normal', 'warning', 'danger'],
      default: 'normal'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Station', stationSchema);
