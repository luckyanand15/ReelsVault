const mongoose = require('mongoose');

// Failed-login counter per email. Unlike the per-IP authLimiter, this can't
// be dodged by spreading guesses for one account across many IPs.
const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

loginAttemptSchema.index({ email: 1 }, { unique: true });
loginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);

LoginAttempt.on('index', err => {
  if (err) {
    console.error('LoginAttempt index build failed:', err);
  }
});

module.exports = LoginAttempt;
