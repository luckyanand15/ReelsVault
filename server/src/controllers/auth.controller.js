const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');

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

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.userId);
  res.status(200).json({ success: true, data: user });
});

module.exports = {
  login,
  refresh,
  logout,
  getMe,
};
