const Joi = require('joi');
const { passwordSchema, confirmPasswordSchema } = require('./user.validator');

const emailSchema = Joi.string().trim().lowercase().email().required();
const codeSchema = Joi.string().trim().length(6).pattern(/^\d+$/).required();
// Issued by POST /account/reauth; verified (signature, expiry) in the service.
const reauthTokenSchema = Joi.string().max(1024).required();

// Same rules as signup.
const updateNameSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().max(50).allow('').optional(),
});

const reauthSchema = Joi.object({
  password: Joi.string().max(1024).required(),
});

const emailOtpSchema = Joi.object({
  reauthToken: reauthTokenSchema,
  newEmail: emailSchema,
});

const confirmEmailSchema = Joi.object({
  reauthToken: reauthTokenSchema,
  newEmail: emailSchema,
  code: codeSchema,
});

const passwordOtpSchema = Joi.object({
  reauthToken: reauthTokenSchema,
});

const verifyPasswordOtpSchema = Joi.object({
  reauthToken: reauthTokenSchema,
  code: codeSchema,
});

const changePasswordSchema = Joi.object({
  reauthToken: reauthTokenSchema,
  // 32 random bytes as hex, issued by /account/password/verify.
  changeToken: Joi.string().hex().length(64).required(),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

const verifyDeleteOtpSchema = Joi.object({
  code: codeSchema,
});

const deleteAccountSchema = Joi.object({
  // 32 random bytes as hex, issued by /account/delete/verify.
  deleteToken: Joi.string().hex().length(64).required(),
  password: Joi.string().max(1024).required(),
});

module.exports = {
  updateNameSchema,
  reauthSchema,
  emailOtpSchema,
  confirmEmailSchema,
  passwordOtpSchema,
  verifyPasswordOtpSchema,
  changePasswordSchema,
  verifyDeleteOtpSchema,
  deleteAccountSchema,
};
