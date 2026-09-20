const Joi = require('joi');

const sendOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string().trim().length(6).pattern(/^\d+$/).required(),
});

module.exports = { sendOtpSchema, verifyOtpSchema };
