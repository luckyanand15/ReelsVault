const rateLimit = require('express-rate-limit');

const genericLimitResponse = {
  success: false,
  message: 'Too many requests. Please try again later.',
};

// Per-IP backstop: a single script hammering many different target emails.
// Kept generous since mobile carriers/NATs can put many real users behind one IP —
// the per-email cooldown in otp.service.js is what actually bounds abuse of one address.
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: genericLimitResponse,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: genericLimitResponse,
});

module.exports = { otpSendLimiter, otpVerifyLimiter };
