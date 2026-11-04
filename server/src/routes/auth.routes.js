const express = require('express');
const validate = require('../middleware/validation.middleware');
const requireAuth = require('../middleware/requireAuth.middleware');
const { authLimiter } = require('../middleware/authRateLimiter');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/otpRateLimiter');
const {
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');
// Same request shapes as the signup OTP endpoints.
const { sendOtpSchema, verifyOtpSchema } = require('../validators/otp.validator');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), controller.refresh);
// No access token required: it may already be expired. Holding the refresh
// token is what proves the right to end that session.
router.post('/logout', validate(refreshTokenSchema), controller.logout);
router.get('/me', requireAuth, controller.getMe);

// Forgot password: send a code, trade it for a reset token, then set the
// new password with that token.
router.post(
  '/password/forgot',
  otpSendLimiter,
  validate(sendOtpSchema),
  controller.forgotPassword,
);
router.post(
  '/password/verify',
  otpVerifyLimiter,
  validate(verifyOtpSchema),
  controller.verifyResetOtp,
);
router.post(
  '/password/reset',
  authLimiter,
  validate(resetPasswordSchema),
  controller.resetPassword,
);

module.exports = router;
