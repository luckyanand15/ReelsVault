const asyncHandler = require('../utils/asyncHandler');
const { ERROR_CODES } = require('../constants/errorCodes');
const reelService = require('../services/reel.service');

const getReels = asyncHandler(async (req, res) => {
  const { reels, nextCursor } = await reelService.getReels(
    req.userId,
    req.query,
  );
  res.status(200).json({ success: true, data: reels, nextCursor });
});

const createReel = asyncHandler(async (req, res) => {
  let result;
  try {
    result = await reelService.createReel(req.body, req.userId);
  } catch (err) {
    if (err instanceof reelService.ReelDailyLimitError) {
      const hours = Math.ceil(err.retryAfter / 3600);
      res.set('Retry-After', String(err.retryAfter));
      return res.status(429).json({
        success: false,
        code: ERROR_CODES.REEL_DAILY_LIMIT,
        retryAfter: err.retryAfter,
        message: `You can save up to ${reelService.MAX_DAILY_REELS} reels a day. Please try again in ${hours} hour${hours === 1 ? '' : 's'}.`,
      });
    }
    // Only a { userId, url } collision means "already in this category"; any
    // other duplicate key is a real server error.
    if (err.code === 11000 && err.keyPattern?.url) {
      return res.status(409).json({
        success: false,
        code: ERROR_CODES.REEL_DUPLICATE,
        message: 'This reel is already saved in this category.',
      });
    }
    throw err;
  }

  if (!result) {
    return res
      .status(404)
      .json({ success: false, message: 'Category not found' });
  }

  // 200 when an existing reel was only added to another category.
  res
    .status(result.created ? 201 : 200)
    .json({ success: true, data: result.reel });
});

// Re-resolves an expired or missing thumbnail. Always 200 with the reel, so
// the client keeps its icon fallback when nothing better was found.
const refreshThumbnail = asyncHandler(async (req, res) => {
  const reel = await reelService.refreshThumbnail(req.params.id, req.userId);
  if (!reel) {
    return res.status(404).json({ success: false, message: 'Reel not found' });
  }
  res.status(200).json({ success: true, data: reel });
});

const updateReel = asyncHandler(async (req, res) => {
  let reel;
  try {
    reel = await reelService.updateReel(req.params.id, req.userId, req.body);
  } catch (err) {
    if (err instanceof reelService.ReelCategoryNotFoundError) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }
    throw err;
  }
  if (!reel) {
    return res.status(404).json({ success: false, message: 'Reel not found' });
  }
  res.status(200).json({ success: true, data: reel });
});

// Body { categoryIds } removes the reel from just those categories; without
// it the reel is deleted outright. deleted says whether the reel is gone
// (it also is once its last category is removed).
const deleteReel = asyncHandler(async (req, res) => {
  const result = await reelService.removeReel(
    req.params.id,
    req.userId,
    req.body?.categoryIds,
  );
  if (!result) {
    return res.status(404).json({ success: false, message: 'Reel not found' });
  }
  res
    .status(200)
    .json({ success: true, data: result.reel, deleted: result.deleted });
});

module.exports = {
  getReels,
  createReel,
  refreshThumbnail,
  updateReel,
  deleteReel,
};
