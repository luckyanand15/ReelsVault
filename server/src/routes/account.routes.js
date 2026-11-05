const express = require('express');
const validate = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/authRateLimiter');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/otpRateLimiter');
const {
  updateNameSchema,
  reauthSchema,
  emailOtpSchema,
  confirmEmailSchema,
  passwordOtpSchema,
  verifyPasswordOtpSchema,
  changePasswordSchema,
} = require('../validators/account.validator');
const controller = require('../controllers/account.controller');

// Mounted behind requireAuth (see app.js).
const router = express.Router();

router.patch('/name', validate(updateNameSchema), controller.updateName);

// Current password -> short-lived reauthToken that every step below requires.
router.post('/reauth', authLimiter, validate(reauthSchema), controller.reauthenticate);

// Change email: send a code to the new address, then confirm it to switch.
router.post(
  '/email/otp',
  otpSendLimiter,
  validate(emailOtpSchema),
  controller.sendEmailChangeOtp,
);
router.post(
  '/email/confirm',
  otpVerifyLimiter,
  validate(confirmEmailSchema),
  controller.confirmEmailChange,
);

// Change password: send a code to the current address, trade it for a
// changeToken, then set the new password with that token.
router.post(
  '/password/otp',
  otpSendLimiter,
  validate(passwordOtpSchema),
  controller.sendPasswordChangeOtp,
);
router.post(
  '/password/verify',
  otpVerifyLimiter,
  validate(verifyPasswordOtpSchema),
  controller.verifyPasswordChangeOtp,
);
router.post(
  '/password',
  authLimiter,
  validate(changePasswordSchema),
  controller.changePassword,
);

module.exports = router;
