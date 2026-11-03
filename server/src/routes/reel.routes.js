const express = require('express');
const validate = require('../middleware/validation.middleware');
const {
  reelCreateLimiter,
  thumbnailRefreshLimiter,
} = require('../middleware/reelRateLimiter');
const {
  createReelSchema,
  reelIdParamSchema,
} = require('../validators/reel.validator');
const controller = require('../controllers/reel.controller');

const router = express.Router();

router.get('/', controller.getReels);
router.post('/', reelCreateLimiter, validate(createReelSchema), controller.createReel);
router.post(
  '/:id/thumbnail',
  thumbnailRefreshLimiter,
  validate(reelIdParamSchema, 'params'),
  controller.refreshThumbnail,
);

module.exports = router;
