const express = require('express');
const validate = require('../middleware/validation.middleware');
const { reelCreateLimiter } = require('../middleware/reelRateLimiter');
const { createReelSchema } = require('../validators/reel.validator');
const controller = require('../controllers/reel.controller');

const router = express.Router();

router.get('/', controller.getReels);
router.post('/', reelCreateLimiter, validate(createReelSchema), controller.createReel);

module.exports = router;
