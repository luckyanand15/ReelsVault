const Reel = require('../models/Reel');
const Category = require('../models/Category');
const generateId = require('../utils/generateId');
const normalizeUrl = require('../utils/normalizeUrl');

const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_REELS = 200;

class ReelDailyLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

const getAllReels = async userId => {
  return Reel.find({ userId }).sort({ createdAt: -1 });
};

// Rolling 24h window, counted from the reels themselves so it survives
// restarts. retryAfter is when the oldest reel in the window ages out.
const assertUnderDailyLimit = async userId => {
  const now = Date.now();
  const windowStart = new Date(now - DAILY_WINDOW_MS);

  const recent = await Reel.find({ userId, createdAt: { $gt: windowStart } })
    .sort({ createdAt: -1 })
    .skip(MAX_DAILY_REELS - 1)
    .limit(1)
    .select('createdAt')
    .lean();

  if (recent.length === 0) {
    return;
  }

  const retryAfter = Math.max(
    Math.ceil((recent[0].createdAt.getTime() + DAILY_WINDOW_MS - now) / 1000),
    1,
  );
  throw new ReelDailyLimitError('Daily reel limit reached.', retryAfter);
};

// Returns null when the category doesn't exist or belongs to another user.
// Otherwise returns { reel, created }: a URL the user already saved elsewhere
// gets this category added instead of a second copy. Throws
// ReelDailyLimitError past MAX_DAILY_REELS, and a duplicate key error
// (code 11000) when the URL is already in this category.
const createReel = async ({ categoryId, title, url }, userId) => {
  const categoryExists = await Category.exists({ _id: categoryId, userId });
  if (!categoryExists) {
    return null;
  }

  await assertUnderDailyLimit(userId);

  // One atomic upsert covers all three cases. When the URL is already in this
  // category the filter matches nothing, so the upsert tries to insert and
  // the unique { userId, url } index rejects it.
  const result = await Reel.findOneAndUpdate(
    { userId, url: normalizeUrl(url), categoryIds: { $ne: categoryId } },
    {
      $addToSet: { categoryIds: categoryId },
      $setOnInsert: { _id: generateId('REEL'), title },
    },
    { upsert: true, returnDocument: 'after', includeResultMetadata: true },
  );

  return {
    reel: result.value,
    created: !result.lastErrorObject?.updatedExisting,
  };
};

module.exports = {
  getAllReels,
  createReel,
  ReelDailyLimitError,
  MAX_DAILY_REELS,
};
