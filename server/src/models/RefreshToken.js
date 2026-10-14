const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    // Only a SHA-256 hash is stored, so a database leak doesn't hand out
    // usable sessions. The raw token is high-entropy random bytes, so a
    // fast hash is enough here (unlike passwords, which need bcrypt).
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Every token produced by rotating from one login shares a family.
    // Reuse of an already-rotated token revokes the whole family, which
    // ends that session for both the attacker and the real client.
    family: {
      type: String,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// Mongo deletes the document once expiresAt passes. Revoked tokens are kept
// until then on purpose, since that's what makes reuse detectable.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
