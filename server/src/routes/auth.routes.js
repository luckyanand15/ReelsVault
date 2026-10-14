const express = require('express');
const validate = require('../middleware/validation.middleware');
const { checkEmailSchema, loginSchema } = require('../validators/auth.validator');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/check-email', validate(checkEmailSchema), controller.checkEmail);
router.post('/login', validate(loginSchema), controller.login);

module.exports = router;
