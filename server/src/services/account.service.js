const User = require('../models/User');
const Category = require('../models/Category');
const Reel = require('../models/Reel');
const SavedReel = require('../models/SavedReel');
const LoginAttempt = require('../models/LoginAttempt');
const authService = require('./auth.service');
const otpService = require('./otp.service');
const tokenService = require('./token.service');
const brevoService = require('./brevo.service');
const { signReauthToken, verifyReauthToken } = require('../utils/jwt');

const { EmailChange, PasswordChange, AccountDelete } = otpService.OTP_PURPOSE;

class UserNotFoundError extends Error {}
class IncorrectPasswordError extends Error {}
class ReauthRequiredError extends Error {}
class EmailInUseError extends Error {}
class SameEmailError extends Error {}
class SamePasswordError extends Error {}
class InvalidChangeTokenError extends Error {}
class InvalidDeleteTokenError extends Error {}

const toSafeUser = user => {
  const { password: _password, ...safeUser } = user.toJSON();
  return safeUser;
};

// Instant: no password or code needed to change your own name.
const updateName = async (userId, { firstName, lastName = '' }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new UserNotFoundError('User not found.');
  }

  user.firstName = firstName;
  user.lastName = lastName;

  // Saving an unchanged name would still bump updatedAt.
  if (user.isModified()) {
    await user.save();
  }
  return toSafeUser(user);
};

// Step one of changing the email or password: the current password, checked
// against the same lockout as login so this can't be used to guess it faster.
const reauthenticate = async (userId, password, ip) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new UserNotFoundError('User not found.');
  }

  await authService.assertNotLocked(user.email, ip);

  if (!(await user.comparePassword(password))) {
    await authService.recordFailedLogin(user.email, ip);
    throw new IncorrectPasswordError('Incorrect password.');
  }

  await authService.clearFailedLogins(user.email, ip);
  return { reauthToken: signReauthToken(user.id) };
};

// Every later step needs the token from reauthenticate, issued to this same
// user within the last few minutes and before any password change since.
const requireReauth = async (userId, reauthToken, { withPassword = false } = {}) => {
  let payload;
  try {
    payload = verifyReauthToken(reauthToken);
  } catch {
    throw new ReauthRequiredError('Please enter your password again.');
  }

  if (payload.sub !== userId) {
    throw new ReauthRequiredError('Please enter your password again.');
  }

  const query = User.findById(userId);
  if (withPassword) {
    query.select('+password');
  }
  const user = await query;
  if (!user) {
    throw new UserNotFoundError('User not found.');
  }

  // `iat` is in whole seconds; compare at that precision (as requireAuth does).
  if (
    user.passwordChangedAt &&
    payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    throw new ReauthRequiredError('Please enter your password again.');
  }

  return user;
};

// Sends the code to the new address: receiving it is what proves the user owns it.
const sendEmailChangeOtp = async (userId, { reauthToken, newEmail }) => {
  const user = await requireReauth(userId, reauthToken);

  if (newEmail === user.email) {
    throw new SameEmailError('This is already your email.');
  }
  if (await User.exists({ email: newEmail })) {
    throw new EmailInUseError('Email is already in use.');
  }

  const code = await otpService.createOtp(newEmail, EmailChange);
  await brevoService.sendEmailChangeOtpEmail(newEmail, code, otpService.OTP_TTL_MINUTES);
};

// Returns { valid: false, message } for a wrong or expired code, otherwise
// changes the email and returns { valid: true, user }.
const confirmEmailChange = async (userId, { reauthToken, newEmail, code }) => {
  const user = await requireReauth(userId, reauthToken);

  const result = await otpService.verifyOtp(newEmail, code, EmailChange);
  if (!result.valid) {
    return result;
  }

  // Spend the code right away so it can't change the email a second time.
  const consumed = await otpService.consumeVerifiedOtp(
    newEmail,
    result.verificationToken,
    EmailChange,
  );
  if (!consumed) {
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  const oldEmail = user.email;
  user.email = newEmail;
  try {
    await user.save();
  } catch (err) {
    // Someone signed up with this address after the code was sent.
    if (err.code === 11000 && err.keyPattern?.email) {
      throw new EmailInUseError('Email is already in use.');
    }
    throw err;
  }

  // The email has already changed, so a failed notice mustn't fail the request.
  try {
    await brevoService.sendEmailChangedEmail(oldEmail, newEmail);
  } catch (err) {
    console.error('Email changed notice failed:', err.message);
  }

  return { valid: true, user: toSafeUser(user) };
};

// Sent to the current address, after the current password was confirmed.
const sendPasswordChangeOtp = async (userId, { reauthToken }) => {
  const user = await requireReauth(userId, reauthToken);
  const code = await otpService.createOtp(user.email, PasswordChange);
  await brevoService.sendPasswordChangeOtpEmail(user.email, code, otpService.OTP_TTL_MINUTES);
};

// Same shape as otpService.verifyOtp: { valid, message } or
// { valid: true, verificationToken }, the token being what changePassword spends.
const verifyPasswordChangeOtp = async (userId, { reauthToken, code }) => {
  const user = await requireReauth(userId, reauthToken);
  return otpService.verifyOtp(user.email, code, PasswordChange);
};

// Returns a fresh token pair for this device; every other session is ended.
const changePassword = async (userId, { reauthToken, changeToken, password }) => {
  const user = await requireReauth(userId, reauthToken, { withPassword: true });

  // Checked before spending the code, so the user can just pick another one.
  if (await user.comparePassword(password)) {
    throw new SamePasswordError('New password must be different from your current one.');
  }

  const isVerified = await otpService.consumeVerifiedOtp(user.email, changeToken, PasswordChange);
  if (!isVerified) {
    throw new InvalidChangeTokenError('Your code has expired. Please start again.');
  }

  // save(), not updateOne: the pre-save hook is what hashes the password.
  user.password = password;
  user.passwordChangedAt = new Date();
  await user.save();

  // Logs out every device (access tokens die via passwordChangedAt in
  // requireAuth), then logs this one straight back in.
  await tokenService.revokeAllForUser(user.id);
  const tokens = await tokenService.issueTokens(user.id);

  try {
    await brevoService.sendPasswordChangedEmail(user.email, { keptCurrentDevice: true });
  } catch (err) {
    console.error('Password changed email failed:', err.message);
  }

  return tokens;
};

// Delete account, step one: a code to the account's own address. Unlike the
// email and password changes this comes before the password, which is the
// last step and is checked in deleteAccount itself.
const sendDeleteAccountOtp = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw new UserNotFoundError('User not found.');
  }
  const code = await otpService.createOtp(user.email, AccountDelete);
  await brevoService.sendAccountDeleteOtpEmail(user.email, code, otpService.OTP_TTL_MINUTES);
};

// Same shape as otpService.verifyOtp; the verificationToken is what
// deleteAccount spends.
const verifyDeleteAccountOtp = async (userId, { code }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new UserNotFoundError('User not found.');
  }
  return otpService.verifyOtp(user.email, code, AccountDelete);
};

// Deletes the user and everything they own. Needs both the token from the
// verified code and the current password.
const deleteAccount = async (userId, { deleteToken, password }, ip) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new UserNotFoundError('User not found.');
  }

  // Same lockout as login, so this can't be used to guess the password faster.
  await authService.assertNotLocked(user.email, ip);
  if (!(await user.comparePassword(password))) {
    await authService.recordFailedLogin(user.email, ip);
    throw new IncorrectPasswordError('Incorrect password.');
  }
  await authService.clearFailedLogins(user.email, ip);

  // Checked after the password, so a typo doesn't spend the code.
  const isVerified = await otpService.consumeVerifiedOtp(user.email, deleteToken, AccountDelete);
  if (!isVerified) {
    throw new InvalidDeleteTokenError('Your code has expired. Please start again.');
  }

  // Sessions first, so nothing can keep using the account while it's being
  // removed. The user goes last: if a step fails it still exists, and the
  // user can log in and delete it again.
  await tokenService.revokeAllForUser(user.id);
  await SavedReel.deleteMany({ userId: user.id });
  await Reel.deleteMany({ userId: user.id });
  await Category.deleteMany({ userId: user.id });
  await LoginAttempt.deleteMany({ email: user.email });
  await User.deleteOne({ _id: user.id });

  // The account is already gone, so a failed notice mustn't fail the request.
  try {
    await brevoService.sendAccountDeletedEmail(user.email);
  } catch (err) {
    console.error('Account deleted email failed:', err.message);
  }
};

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
  UserNotFoundError,
  IncorrectPasswordError,
  ReauthRequiredError,
  EmailInUseError,
  SameEmailError,
  SamePasswordError,
  InvalidChangeTokenError,
  InvalidDeleteTokenError,
};
