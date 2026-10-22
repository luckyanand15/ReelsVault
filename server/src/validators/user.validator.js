const Joi = require('joi');

// Must contain a letter; numbers and special characters are optional.
// Keep in sync with the client's SignupPassword and ForgotPasswordReset screens.
// Max is 72 UTF-8 bytes because bcrypt silently ignores anything past that.
const passwordSchema = Joi.string()
  .min(8)
  .max(72, 'utf8')
  .pattern(/[A-Za-z]/)
  .required()
  .messages({
    'string.pattern.base': 'Password must include at least one letter',
    'string.max': 'Password must be 72 characters or fewer',
  });

const confirmPasswordSchema = Joi.string()
  .valid(Joi.ref('password'))
  .required()
  .messages({ 'any.only': 'Passwords do not match' });

const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().max(50).allow('').optional(),
  email: Joi.string().trim().lowercase().email().required(),
  verificationToken: Joi.string().required(),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

module.exports = {
  createUserSchema,
  passwordSchema,
  confirmPasswordSchema,
};
