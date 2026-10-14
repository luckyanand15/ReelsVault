const express = require('express');
const validate = require('../middleware/validation.middleware');
const requireAuth = require('../middleware/requireAuth.middleware');
const { authLimiter } = require('../middleware/authRateLimiter');
const {
  checkEmailSchema,
  loginSchema,
  refreshTokenSchema,
} = require('../validators/auth.validator');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/check-email', validate(checkEmailSchema), controller.checkEmail);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), controller.refresh);
// No access token required: it may already be expired. Holding the refresh
// token is what proves the right to end that session.
router.post('/logout', validate(refreshTokenSchema), controller.logout);
router.get('/me', requireAuth, controller.getMe);

module.exports = router;
