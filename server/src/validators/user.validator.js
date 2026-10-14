const Joi = require('joi');

const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().max(50).allow('').optional(),
  email: Joi.string().trim().lowercase().email().required(),
  verificationToken: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});

module.exports = {
  createUserSchema,
};
