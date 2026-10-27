const rateLimit = require('express-rate-limit');

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
    code: 'RATE_LIMITED',
    message: 'You are adding reels too quickly. Please wait a minute.',
  },
});

module.exports = { reelCreateLimiter };
