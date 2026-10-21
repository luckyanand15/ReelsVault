const mongoose = require('mongoose');

// Failed-login counter per email + IP pair. Keyed on both so a stranger
// guessing from their own IP locks only themselves out of that account,
// not the real owner on a different IP.
const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    ip: {
      type: String,
      required: true,
    },
    failures: {
      type: Number,
      default: 0,
    },
    // End of the current counting window, or of the lockout once the limit
    // is hit. Mongo deletes the document after this, which resets the count.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

loginAttemptSchema.index({ email: 1, ip: 1 }, { unique: true });
loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

LoginAttempt.on('index', err => {
  if (err) {
    console.error('LoginAttempt index build failed:', err);
  }
});

module.exports = LoginAttempt;
