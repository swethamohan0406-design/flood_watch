const mongoose = require('mongoose');

/**
 * Alert Model
 * Tracks automatic warnings and danger notifications triggered by critical water levels.
 */
const alertSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required']
    },
    severity: {
      type: String,
      enum: ['warning', 'danger'],
      required: [true, 'Alert severity is required']
    },
    message: {
      type: String,
      required: [true, 'Alert message is required']
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Alert', alertSchema);
