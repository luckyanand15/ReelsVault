const asyncHandler = require('../utils/asyncHandler');
const reelService = require('../services/reel.service');

const getReels = asyncHandler(async (req, res) => {
  const reels = await reelService.getAllReels(req.userId);
  res.status(200).json({ success: true, data: reels });
});

const createReel = asyncHandler(async (req, res) => {
  const reel = await reelService.createReel(req.body, req.userId);

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
