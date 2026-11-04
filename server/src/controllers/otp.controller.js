const asyncHandler = require('../utils/asyncHandler');
const otpService = require('../services/otp.service');
const brevoService = require('../services/brevo.service');
const userService = require('../services/user.service');
const { sendDailyLimit, sendCooldown } = require('../utils/otpLimitResponses');

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
      return sendCooldown(res, err);
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
