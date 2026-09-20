const User = require('../models/User');
const generateId = require('../utils/generateId');
const otpService = require('./otp.service');

const createUser = async ({ firstName, lastName, email, verificationToken }) => {
  const isVerified = await otpService.consumeVerifiedOtp(email, verificationToken);
  if (!isVerified) {
    throw new otpService.EmailNotVerifiedError('Email has not been verified.');
  }

  const id = await generateId('user', 'USER');

  return User.create({ _id: id, firstName, lastName, email });
};

module.exports = {
  createUser,
};
