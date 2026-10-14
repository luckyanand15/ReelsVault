const User = require('../models/User');
const userService = require('./user.service');

class UserNotFoundError extends Error {}
class InvalidCredentialsError extends Error {}

const checkEmailExists = email => userService.isEmailRegistered(email);

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UserNotFoundError('Email not found.');
  }

  if (user.password !== password) {
    throw new InvalidCredentialsError('Incorrect password.');
  }

  const { password: _password, ...safeUser } = user.toJSON();
  return safeUser;
};

module.exports = {
  checkEmailExists,
  login,
  UserNotFoundError,
  InvalidCredentialsError,
};
