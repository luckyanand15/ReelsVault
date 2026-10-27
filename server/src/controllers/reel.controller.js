const asyncHandler = require('../utils/asyncHandler');
const reelService = require('../services/reel.service');

const getReels = asyncHandler(async (req, res) => {
  const reels = await reelService.getAllReels(req.userId);
  res.status(200).json({ success: true, data: reels });
});

const createReel = asyncHandler(async (req, res) => {
  let reel;
  try {
    reel = await reelService.createReel(req.body, req.userId);
  } catch (err) {
    if (err instanceof reelService.ReelDailyLimitError) {
      const hours = Math.ceil(err.retryAfter / 3600);
      res.set('Retry-After', String(err.retryAfter));
      return res.status(429).json({
        success: false,
        code: 'REEL_DAILY_LIMIT',
        retryAfter: err.retryAfter,
        message: `You can save up to ${reelService.MAX_DAILY_REELS} reels a day. Please try again in ${hours} hour${hours === 1 ? '' : 's'}.`,
      });
    }
    // Only a { userId, url } collision means "already saved"; any other
    // duplicate key is a real server error.
    if (err.code === 11000 && err.keyPattern?.url) {
      return res.status(409).json({
        success: false,
        code: 'REEL_DUPLICATE',
        message: 'You have already saved this reel.',
      });
    }
    throw err;
  }

  if (!reel) {
    return res
      .status(404)
      .json({ success: false, message: 'Category not found' });
  }

  res.status(201).json({ success: true, data: reel });
});

module.exports = {
  getReels,
  createReel,
};
