const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const userService = require('./user.service');
const tokenService = require('./token.service');

const MAX_FAILED_LOGINS = 5;
const FAILED_LOGIN_WINDOW_MINUTES = 15;
const LOGIN_LOCK_MINUTES = 15;

class UserNotFoundError extends Error {}
class InvalidCredentialsError extends Error {}
class LoginLockedError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

const checkEmailExists = email => userService.isEmailRegistered(email);

// Checked before the password, so a locked account rejects even a correct
// guess — otherwise the lock wouldn't stop anything.
const assertNotLocked = async email => {
  const now = Date.now();
  const attempt = await LoginAttempt.findOne({ email, expiresAt: { $gt: new Date(now) } }).lean();

  if (attempt && attempt.failures >= MAX_FAILED_LOGINS) {
    const retryAfter = Math.max(Math.ceil((attempt.expiresAt.getTime() - now) / 1000), 1);
    throw new LoginLockedError('Too many failed login attempts.', retryAfter);
  }
};

const recordFailedLogin = async email => {
  const now = Date.now();

  // Mongo's TTL sweep only runs about once a minute, so an expired record
  // can still be around. Clear it so this failure starts a fresh window.
  await LoginAttempt.deleteOne({ email, expiresAt: { $lte: new Date(now) } });

  const update = {
    $inc: { failures: 1 },
    $setOnInsert: { expiresAt: new Date(now + FAILED_LOGIN_WINDOW_MINUTES * 60 * 1000) },
  };

  let attempt;
  try {
    attempt = await LoginAttempt.findOneAndUpdate({ email }, update, {
      upsert: true,
      returnDocument: 'after',
    });
  } catch (err) {
    // A concurrent failure inserted the record first; it exists now, so just increment it.
    if (err.code !== 11000) {
      throw err;
    }
    attempt = await LoginAttempt.findOneAndUpdate({ email }, update, { returnDocument: 'after' });
  }

  if (attempt && attempt.failures >= MAX_FAILED_LOGINS) {
    await LoginAttempt.updateOne(
      { _id: attempt._id },
      { $set: { expiresAt: new Date(now + LOGIN_LOCK_MINUTES * 60 * 1000) } },
    );
  }
};

const login = async ({ email, password }) => {
  await assertNotLocked(email);

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UserNotFoundError('Email not found.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await recordFailedLogin(email);
    throw new InvalidCredentialsError('Incorrect password.');
  }

  await LoginAttempt.deleteOne({ email });

  const { password: _password, ...safeUser } = user.toJSON();
  const tokens = await tokenService.issueTokens(user.id);
  return { user: safeUser, ...tokens };
};

const getUserById = async id => {
  const user = await User.findById(id);
  return user ? user.toJSON() : null;
};

module.exports = {
  checkEmailExists,
  login,
  getUserById,
  UserNotFoundError,
  InvalidCredentialsError,
  LoginLockedError,
};
