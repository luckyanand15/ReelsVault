const express = require('express');
const validate = require('../middleware/validation.middleware');
const { createUserSchema } = require('../validators/user.validator');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.post('/', validate(createUserSchema), controller.createUser);

module.exports = router;
