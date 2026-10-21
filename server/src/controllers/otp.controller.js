const asyncHandler = require('../utils/asyncHandler');
const otpService = require('../services/otp.service');
const brevoService = require('../services/brevo.service');
const userService = require('../services/user.service');

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

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // No point sending a code for an address that can't be used to sign up
  if (await userService.isEmailRegistered(email)) {
    return res
      .status(409)
      .json({ success: false, message: 'Email is already in use' });
  }

  let code;
  try {
    code = await otpService.createOtp(email);
  } catch (err) {
    if (err instanceof otpService.OtpCooldownError) {
      // Distinct from the per-IP RATE_LIMITED response: this one means a code
      // was already sent to this address and is still in the inbox, so the
      // client can carry on to the code screen instead of showing an error.
      res.set('Retry-After', String(err.retryAfter));
      return res.status(429).json({
        success: false,
        code: 'OTP_COOLDOWN',
        retryAfter: err.retryAfter,
        message: `An OTP was already sent. You can request a new one in ${err.retryAfter}s.`,
      });
    }
    if (err instanceof otpService.OtpDailyLimitError) {
      return sendDailyLimit(res, err);
    }
    throw err;
  }

  await brevoService.sendOtpEmail(email, code, otpService.OTP_TTL_MINUTES);

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  let result;
  try {
    result = await otpService.verifyOtp(email, code);
  } catch (err) {
    if (err instanceof otpService.OtpDailyLimitError) {
      return sendDailyLimit(res, err);
    }
    throw err;
  }

  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: { verificationToken: result.verificationToken },
  });
});

module.exports = { sendOtp, verifyOtp };
