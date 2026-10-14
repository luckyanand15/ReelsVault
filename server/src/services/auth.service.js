const User = require('../models/User');
const userService = require('./user.service');
const tokenService = require('./token.service');

class UserNotFoundError extends Error {}
class InvalidCredentialsError extends Error {}

const checkEmailExists = email => userService.isEmailRegistered(email);

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UserNotFoundError('Email not found.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new InvalidCredentialsError('Incorrect password.');
  }

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
};
