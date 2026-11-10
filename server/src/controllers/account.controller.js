const asyncHandler = require('../utils/asyncHandler');
const { ERROR_CODES } = require('../constants/errorCodes');
const accountService = require('../services/account.service');
const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const { sendDailyLimit, sendCooldown } = require('../utils/otpLimitResponses');

// Errors any account step can throw. Returns true once a response is sent.
// Nothing here answers 401: the client treats a 401 as an expired session
// and would refresh and retry, so a wrong password or stale step is 400/403.
const handleAccountError = (res, err) => {
  if (err instanceof accountService.ReauthRequiredError) {
    res.status(403).json({
      success: false,
      code: ERROR_CODES.REAUTH_REQUIRED,
      message: 'This took too long. Please enter your password again.',
    });
    return true;
  }
  if (err instanceof accountService.UserNotFoundError) {
    res.status(404).json({ success: false, message: 'User not found' });
    return true;
  }
  if (err instanceof otpService.OtpCooldownError) {
    sendCooldown(res, err);
    return true;
  }
  if (err instanceof otpService.OtpDailyLimitError) {
    sendDailyLimit(res, err);
    return true;
  }
  return false;
};

const sendLoginLocked = (res, err) => {
  const minutes = Math.ceil(err.retryAfter / 60);
  res.set('Retry-After', String(err.retryAfter));
  return res.status(429).json({
    success: false,
    code: ERROR_CODES.LOGIN_LOCKED,
    retryAfter: err.retryAfter,
    message: `Too many incorrect passwords. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
  });
};

const handled = handler =>
  asyncHandler(async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      if (!handleAccountError(res, err)) {
        throw err;
      }
    }
  });

const updateName = handled(async (req, res) => {
  const user = await accountService.updateName(req.userId, req.body);
  res.status(200).json({ success: true, data: user });
});

const reauthenticate = handled(async (req, res) => {
  try {
    // req.ip is the real client IP thanks to `trust proxy` in app.js.
    const data = await accountService.reauthenticate(req.userId, req.body.password, req.ip);
    res.status(200).json({ success: true, data });
  } catch (err) {
    if (err instanceof authService.LoginLockedError) {
      return sendLoginLocked(res, err);
    }
    if (err instanceof accountService.IncorrectPasswordError) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    throw err;
  }
});

const sendEmailChangeOtp = handled(async (req, res) => {
  try {
    await accountService.sendEmailChangeOtp(req.userId, req.body);
  } catch (err) {
    if (err instanceof accountService.EmailInUseError) {
      return res.status(409).json({ success: false, message: 'Email is already in use' });
    }
    if (err instanceof accountService.SameEmailError) {
      return res.status(400).json({ success: false, message: 'This is already your email' });
    }
    throw err;
  }
  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

const confirmEmailChange = handled(async (req, res) => {
  let result;
  try {
    result = await accountService.confirmEmailChange(req.userId, req.body);
  } catch (err) {
    if (err instanceof accountService.EmailInUseError) {
      return res.status(409).json({ success: false, message: 'Email is already in use' });
    }
    throw err;
  }

  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }
  res.status(200).json({ success: true, message: 'Email updated', data: result.user });
});

const sendPasswordChangeOtp = handled(async (req, res) => {
  await accountService.sendPasswordChangeOtp(req.userId, req.body);
  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

const verifyPasswordChangeOtp = handled(async (req, res) => {
  const result = await accountService.verifyPasswordChangeOtp(req.userId, req.body);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: { changeToken: result.verificationToken },
  });
});

const changePassword = handled(async (req, res) => {
  let tokens;
  try {
    tokens = await accountService.changePassword(req.userId, req.body);
  } catch (err) {
    if (err instanceof accountService.SamePasswordError) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current one',
      });
    }
    if (err instanceof accountService.InvalidChangeTokenError) {
      return res.status(400).json({
        success: false,
        code: ERROR_CODES.CHANGE_TOKEN_INVALID,
        message: 'Your code has expired. Please start again.',
      });
    }
    throw err;
  }
  // This device's sessions were revoked along with every other one, so it
  // gets a fresh pair to carry on with.
  res.status(200).json({ success: true, message: 'Password updated', data: tokens });
});

const sendDeleteAccountOtp = handled(async (req, res) => {
  await accountService.sendDeleteAccountOtp(req.userId);
  res.status(200).json({ success: true, message: 'OTP sent successfully' });
});

const verifyDeleteAccountOtp = handled(async (req, res) => {
  const result = await accountService.verifyDeleteAccountOtp(req.userId, req.body);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.message });
  }
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: { deleteToken: result.verificationToken },
  });
});

const deleteAccount = handled(async (req, res) => {
  try {
    await accountService.deleteAccount(req.userId, req.body, req.ip);
  } catch (err) {
    if (err instanceof authService.LoginLockedError) {
      return sendLoginLocked(res, err);
    }
    if (err instanceof accountService.IncorrectPasswordError) {
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }
    if (err instanceof accountService.InvalidDeleteTokenError) {
      return res.status(400).json({
        success: false,
        code: ERROR_CODES.DELETE_TOKEN_INVALID,
        message: 'Your code has expired. Please start again.',
      });
    }
    throw err;
  }
  res.status(200).json({ success: true, message: 'Account deleted' });
});

module.exports = {
  updateName,
  reauthenticate,
  sendEmailChangeOtp,
  confirmEmailChange,
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
  changePassword,
  sendDeleteAccountOtp,
  verifyDeleteAccountOtp,
  deleteAccount,
};
