const Joi = require('joi');

const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().max(50).allow('').optional(),
  email: Joi.string().trim().lowercase().email().required(),
  verificationToken: Joi.string().required(),
  // Must contain a letter; numbers and special characters are optional.
  // Keep in sync with the client's SignupPassword screen.
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Za-z]/)
    .required()
    .messages({ 'string.pattern.base': 'Password must include at least one letter' }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

module.exports = {
  createUserSchema,
};
