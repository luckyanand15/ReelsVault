const Joi = require('joi');

const checkEmailSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  checkEmailSchema,
  loginSchema,
};
