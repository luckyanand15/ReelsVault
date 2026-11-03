const express = require('express');
const validate = require('../middleware/validation.middleware');
const {
  reelCreateLimiter,
  thumbnailRefreshLimiter,
} = require('../middleware/reelRateLimiter');
const {
  createReelSchema,
  reelIdParamSchema,
  updateReelSchema,
  deleteReelSchema,
  listReelsQuerySchema,
} = require('../validators/reel.validator');
const controller = require('../controllers/reel.controller');

const router = express.Router();

router.get('/', validate(listReelsQuerySchema, 'query'), controller.getReels);
router.post('/', reelCreateLimiter, validate(createReelSchema), controller.createReel);
router.post(
  '/:id/thumbnail',
  thumbnailRefreshLimiter,
  validate(reelIdParamSchema, 'params'),
  controller.refreshThumbnail,
);
router.patch(
  '/:id',
  validate(reelIdParamSchema, 'params'),
  validate(updateReelSchema),
  controller.updateReel,
);

router.delete(
  '/:id',
  validate(reelIdParamSchema, 'params'),
  validate(deleteReelSchema),
  controller.deleteReel,
);

module.exports = router;
