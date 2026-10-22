const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const otpService = require('../services/otp.service');
const userService = require('../services/user.service');
const brevoService = require('../services/brevo.service');
const { sendDailyLimit, sendCooldown } = require('../utils/otpLimitResponses');

const { PasswordReset } = otpService.OTP_PURPOSE;

const login = asyncHandler(async (req, res) => {
  try {
    // req.ip is the real client IP thanks to `trust proxy` in app.js.
    const session = await authService.login(req.body, req.ip);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    if (err instanceof authService.LoginLockedError) {
      const minutes = Math.ceil(err.retryAfter / 60);
      res.set('Retry-After', String(err.retryAfter));
      return res.status(429).json({
        success: false,
        code: 'LOGIN_LOCKED',
        retryAfter: err.retryAfter,
        message: `Too many failed login attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      });
    }
    if (err instanceof authService.InvalidCredentialsError) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    throw err;
  }
});

const refresh = asyncHandler(async (req, res) => {
  try {
    const tokens = await tokenService.rotateRefreshToken(req.body.refreshToken);
    res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    if (err instanceof tokenService.InvalidRefreshTokenError) {
      return res
        .status(401)
        .json({ success: false, message: 'Session expired. Please log in again.' });
    }
    throw err;
  }
});

const logout = asyncHandler(async (req, res) => {
  await tokenService.revokeRefreshToken(req.body.refreshToken);
  res.status(200).json({ success: true, message: 'Logged out' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Same response whether or not the email has an account, so this can't be
  // used to find out who is registered. Only a real account gets an email.
  if (await userService.isEmailRegistered(email)) {
    let code;
    try {
      code = await otpService.createOtp(email, PasswordReset);
    } catch (err) {
      if (err instanceof otpService.OtpCooldownError) {
        return sendCooldown(res, err);
      }
      if (err instanceof otpService.OtpDailyLimitError) {
        return sendDailyLimit(res, err);
      }
      throw err;
    }

    await brevoService.sendPasswordResetEmail(email, code, otpService.OTP_TTL_MINUTES);
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, we sent a code to it.',
  });
});

const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  let result;
  try {
    result = await otpService.verifyOtp(email, code, PasswordReset);
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
    data: { resetToken: result.verificationToken },
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    await authService.resetPassword(req.body, req.ip);
  } catch (err) {
    if (err instanceof authService.InvalidResetTokenError) {
      return res.status(400).json({
        success: false,
        code: 'RESET_TOKEN_INVALID',
        message: 'Your reset code has expired. Please start again.',
      });
    }
    throw err;
  }

  // No tokens returned: the user logs in again with the new password.
  res.status(200).json({ success: true, message: 'Password updated. Please log in.' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.userId);
  res.status(200).json({ success: true, data: user });
});

module.exports = {
  login,
  refresh,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
};
