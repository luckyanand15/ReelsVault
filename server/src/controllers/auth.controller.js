const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');

const checkEmail = asyncHandler(async (req, res) => {
  const exists = await authService.checkEmailExists(req.body.email);
  res.status(200).json({ success: true, data: { exists } });
});

const login = asyncHandler(async (req, res) => {
  try {
    const session = await authService.login(req.body);
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
    if (err instanceof authService.UserNotFoundError) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    if (err instanceof authService.InvalidCredentialsError) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
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

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.userId);
  res.status(200).json({ success: true, data: user });
});

module.exports = {
  checkEmail,
  login,
  refresh,
  logout,
  getMe,
};
