const rateLimit = require('express-rate-limit');
const { ERROR_CODES } = require('../constants/errorCodes');

// Per-user burst limit on saving reels. Mounted after requireAuth, so
// req.userId is always set. The 200/day cap lives in reel.service.js since it
// has to survive restarts, which this in-memory store doesn't.
const reelCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.userId,
  message: {
    success: false,
    code: ERROR_CODES.RATE_LIMITED,
    message: 'You are adding reels too quickly. Please wait a minute.',
  },
});

// Thumbnail refreshes fire from the list as expired images fail to load, so
// allow a screenful at once but stop a client stuck in a retry loop.
const thumbnailRefreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.userId,
  message: {
    success: false,
    code: ERROR_CODES.RATE_LIMITED,
    message: 'Too many thumbnail refreshes. Please wait a minute.',
  },
});

module.exports = { reelCreateLimiter, thumbnailRefreshLimiter };
