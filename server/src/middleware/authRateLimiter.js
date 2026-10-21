const rateLimit = require('express-rate-limit');

// Per-IP backstop against password guessing and refresh-token brute forcing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

module.exports = { authLimiter };
