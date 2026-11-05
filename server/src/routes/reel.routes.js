const express = require('express');
const validate = require('../middleware/validation.middleware');
const {
  reelCreateLimiter,
  thumbnailRefreshLimiter,
  reelPreviewLimiter,
} = require('../middleware/reelRateLimiter');
const {
  createReelSchema,
  reelPreviewQuerySchema,
  reelIdParamSchema,
  updateReelSchema,
  deleteReelSchema,
  listReelsQuerySchema,
  searchReelsQuerySchema,
} = require('../validators/reel.validator');
const controller = require('../controllers/reel.controller');

const router = express.Router();

router.get('/', validate(listReelsQuerySchema, 'query'), controller.getReels);
router.get(
  '/search',
  validate(searchReelsQuerySchema, 'query'),
  controller.searchReels,
);
// Title suggestion for a link in the Add Reel drawer.
router.get(
  '/preview',
  reelPreviewLimiter,
  validate(reelPreviewQuerySchema, 'query'),
  controller.previewReel,
);
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
