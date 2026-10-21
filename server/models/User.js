const mongoose = require('mongoose');

/**
 * User Model
 * Stores system users with role-based access control ("admin" or "observer").
 * Note: Password hashing is intentionally performed inside authController to keep things simple
 * and avoid accidental double-hashing hooks.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password']
    },
    role: {
      type: String,
      enum: ['admin', 'observer'],
      default: 'observer'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
