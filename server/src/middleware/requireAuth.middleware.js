const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const unauthorized = (res, message) =>
  res.status(401).json({ success: false, message });

const requireAuth = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.header('authorization') || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return unauthorized(res, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    return unauthorized(
      res,
      err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token',
    );
  }

  // A validly signed token for a since-deleted account must not keep working.
  const user = payload.sub
    ? await User.findById(payload.sub).select('passwordChangedAt').lean()
    : null;
  if (!user) {
    return unauthorized(res, 'Invalid token');
  }

  // Nor one issued before a password reset. `iat` is in whole seconds, so
  // compare at that precision or a login right after the reset would fail.
  if (
    user.passwordChangedAt &&
    payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    return unauthorized(res, 'Session expired. Please log in again.');
  }

  req.userId = payload.sub;
  next();
});

module.exports = requireAuth;
