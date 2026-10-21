const mongoose = require('mongoose');

// Daily OTP counters per email. Unlike the Otp record, requesting a new code
// doesn't reset these, so the per-code guess limit can't be renewed forever.
const otpUsageSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    sends: {
      type: Number,
      default: 0,
    },
    verifyAttempts: {
      type: Number,
      default: 0,
    },
    // 24h after the first send or guess. Mongo deletes the document after
    // this, which resets both counters.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

otpUsageSchema.index({ email: 1 }, { unique: true });
otpUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpUsage = mongoose.model('OtpUsage', otpUsageSchema);

OtpUsage.on('index', err => {
  if (err) {
    console.error('OtpUsage index build failed:', err);
  }
});

module.exports = OtpUsage;
