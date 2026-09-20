const asyncHandler = require('../utils/asyncHandler');
const otpService = require('../services/otp.service');
const brevoService = require('../services/brevo.service');

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  let code;
  try {
    code = await otpService.createOtp(email);
  } catch (err) {
    if (err instanceof otpService.OtpCooldownError) {
      return res
        .status(429)
        .json({ success: false, message: 'Too many requests. Please try again later.' });
    }
    throw err;
  }

  await brevoService.sendOtpEmail(email, code, otpService.OTP_TTL_MINUTES);

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const result = await otpService.verifyOtp(email, code);

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
