const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { signAccessToken } = require('../utils/jwt');

const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30;

class InvalidRefreshTokenError extends Error {}

const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

const issueTokens = async (userId, family = crypto.randomUUID()) => {
  const refreshToken = crypto.randomBytes(48).toString('hex');

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    family,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });

  return { accessToken: signAccessToken(userId), refreshToken };
};

const revokeFamily = family =>
  RefreshToken.updateMany({ family, revokedAt: null }, { $set: { revokedAt: new Date() } });

const rotateRefreshToken = async refreshToken => {
  const tokenHash = hashToken(refreshToken);

  // Atomic claim: of two concurrent requests with the same token, only one
  // can flip revokedAt from null, so a token is never redeemed twice.
  const current = await RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { revokedAt: new Date() } },
  );

  if (!current) {
    // A known-but-already-rotated token being presented again means it was
    // copied somewhere. Kill that whole session rather than guess which
    // holder is legitimate.
    const reused = await RefreshToken.findOne({ tokenHash, revokedAt: { $ne: null } });
    if (reused) {
      await revokeFamily(reused.family);
    }
    throw new InvalidRefreshTokenError('Invalid refresh token.');
  }

  // A password reset revokes every token, but a refresh already past the
  // claim above when that happened would otherwise mint a fresh one.
  const user = await User.findById(current.userId).select('passwordChangedAt').lean();
  if (!user || (user.passwordChangedAt && current.createdAt < user.passwordChangedAt)) {
    await revokeFamily(current.family);
    throw new InvalidRefreshTokenError('Invalid refresh token.');
  }

  return issueTokens(current.userId, current.family);
};

const revokeRefreshToken = async refreshToken => {
  const token = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) });
  if (token) {
    await revokeFamily(token.family);
  }
};

// Ends every session the user has, on every device.
const revokeAllForUser = userId =>
  RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });

module.exports = {
  issueTokens,
  revokeAllForUser,
  rotateRefreshToken,
  revokeRefreshToken,
  InvalidRefreshTokenError,
};
