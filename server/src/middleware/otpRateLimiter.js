const rateLimit = require('express-rate-limit');

// Includes a code and the seconds until the window resets, so the client can
// tell this apart from the per-email OTP_COOLDOWN and show the real wait.
const rateLimitHandler = (req, res, next, options) => {
  const resetTime = req.rateLimit?.resetTime;
  const retryAfter = resetTime
    ? Math.max(Math.ceil((resetTime.getTime() - Date.now()) / 1000), 1)
    : undefined;

  res.status(options.statusCode).json({
    success: false,
    code: 'RATE_LIMITED',
    retryAfter,
    message: 'Too many requests. Please try again later.',
  });
};

// Per-IP backstop: a single script hammering many different target emails.
// Kept generous since mobile carriers/NATs can put many real users behind one IP —
// the per-email cooldown in otp.service.js is what actually bounds abuse of one address.
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { otpSendLimiter, otpVerifyLimiter };
