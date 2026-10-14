const User = require('../models/User');
const generateId = require('../utils/generateId');
const otpService = require('./otp.service');

const createUser = async ({ firstName, lastName, email, verificationToken, password }) => {
  const isVerified = await otpService.consumeVerifiedOtp(email, verificationToken);
  if (!isVerified) {
    throw new otpService.EmailNotVerifiedError('Email has not been verified.');
  }

  const id = await generateId('user', 'USER');

  const user = await User.create({ _id: id, firstName, lastName, email, password });

  // select: false only applies to queries, not to the document returned by create
  const { password: _password, ...safeUser } = user.toJSON();
  return safeUser;
};

const isEmailRegistered = async email => Boolean(await User.exists({ email }));

module.exports = {
  createUser,
  isEmailRegistered,
};
