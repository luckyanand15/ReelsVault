const express = require('express');
const validate = require('../middleware/validation.middleware');
const { createReelSchema } = require('../validators/reel.validator');
const controller = require('../controllers/reel.controller');

const router = express.Router();

router.get('/', controller.getReels);
router.post('/', validate(createReelSchema), controller.createReel);

module.exports = router;
