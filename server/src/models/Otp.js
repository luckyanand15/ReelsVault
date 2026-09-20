const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    // Set only once verified. Binds "this OTP was correctly guessed" to
    // whichever client received it in the /verify response — account
    // creation requires an exact match, so a third party who merely knows
    // the target email (not the code) can't race to claim someone else's
    // completed verification.
    verificationToken: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    // Deliberately separate from `createdAt`: Mongoose's `timestamps: true`
    // silently strips `createdAt` out of any $set on an update (it only ever
    // sets it on genuine inserts), so the cooldown check in otp.service.js
    // needs its own field it can actually overwrite on every resend.
    lastSentAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// One active OTP per email, enforced by the database (not just app logic) —
// this is what makes concurrent send requests for the same email race-safe.
otpSchema.index({ email: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);

// Mongoose builds indexes in the background and won't surface a failure
// (e.g. a conflicting existing index) anywhere else — without this, the
// unique constraint the send-race fix depends on could silently not exist.
Otp.on('index', err => {
  if (err) {
    console.error('Otp index build failed:', err);
  }
});

module.exports = Otp;
