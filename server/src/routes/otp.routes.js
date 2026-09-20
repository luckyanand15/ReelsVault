const express = require('express');
const validate = require('../middleware/validation.middleware');
const { otpSendLimiter, otpVerifyLimiter } = require('../middleware/otpRateLimiter');
const { sendOtpSchema, verifyOtpSchema } = require('../validators/otp.validator');
const controller = require('../controllers/otp.controller');

const router = express.Router();

router.post('/send', otpSendLimiter, validate(sendOtpSchema), controller.sendOtp);
router.post('/verify', otpVerifyLimiter, validate(verifyOtpSchema), controller.verifyOtp);

module.exports = router;
