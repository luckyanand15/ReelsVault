const sendDailyLimit = (res, err) => {
  const hours = Math.ceil(err.retryAfter / 3600);
  res.set('Retry-After', String(err.retryAfter));
  return res.status(429).json({
    success: false,
    code: 'OTP_DAILY_LIMIT',
    retryAfter: err.retryAfter,
    message: `Too many verification attempts for this email. Please try again in ${hours} hour${hours === 1 ? '' : 's'}.`,
  });
};

// Distinct from the per-IP RATE_LIMITED response: this one means a code
// was already sent to this address and is still in the inbox, so the
// client can carry on to the code screen instead of showing an error.
const sendCooldown = (res, err) => {
  res.set('Retry-After', String(err.retryAfter));
  return res.status(429).json({
    success: false,
    code: 'OTP_COOLDOWN',
    retryAfter: err.retryAfter,
    message: `An OTP was already sent. You can request a new one in ${err.retryAfter}s.`,
  });
};

module.exports = { sendDailyLimit, sendCooldown };
