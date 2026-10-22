const Joi = require('joi');
const { passwordSchema, confirmPasswordSchema } = require('./user.validator');

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().hex().length(96).required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  // 32 random bytes as hex, issued by /password/verify.
  resetToken: Joi.string().hex().length(64).required(),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
};
