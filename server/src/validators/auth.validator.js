const Joi = require('joi');

const checkEmailSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().hex().length(96).required(),
});

module.exports = {
  checkEmailSchema,
  loginSchema,
  refreshTokenSchema,
};
