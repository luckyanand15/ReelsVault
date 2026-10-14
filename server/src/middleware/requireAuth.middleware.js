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
  if (!payload.sub || !(await User.exists({ _id: payload.sub }))) {
    return unauthorized(res, 'Invalid token');
  }

  req.userId = payload.sub;
  next();
});

module.exports = requireAuth;
