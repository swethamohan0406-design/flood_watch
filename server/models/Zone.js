const mongoose = require('mongoose');

/**
 * Zone Model
 * Represents a flood-prone residential or ecological zone associated with a monitoring station.
 */
const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Risk level is required']
    },
    populationAtRisk: {
      type: Number,
      default: 0
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Associated station reference is required']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Zone', zoneSchema);
