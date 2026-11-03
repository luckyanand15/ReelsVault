const Reel = require('../models/Reel');
const Category = require('../models/Category');
const generateId = require('../utils/generateId');
const normalizeUrl = require('../utils/normalizeUrl');
const resolveThumbnail = require('../utils/resolveThumbnail');

const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_REELS = 200;

class ReelDailyLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

// One page, newest first by createdAt, with _id settling reels saved in the
// same millisecond. createdAt + id are the last reel the client has; the
// page continues right after it, so a reel added mid-scroll can't shift the
// next page the way skip() would. nextCursor is the pair to send for the
// following page, null on the last one.
const getReels = async (userId, { categoryId, createdAt, id, limit }) => {
  const filter = { userId };
  if (categoryId) {
    filter.categoryIds = categoryId;
  }
  if (createdAt) {
    filter.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: id } },
    ];
  }

  // One extra tells whether another page exists.
  const found = await Reel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);
  const reels = found.slice(0, limit);
  const last = reels[reels.length - 1];
  const nextCursor =
    found.length > limit ? { createdAt: last.createdAt, id: last.id } : null;
  return { reels, nextCursor };
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

  const normalizedUrl = normalizeUrl(url);

  // Only a brand-new reel needs a thumbnail lookup; an existing one already
  // has its own (or gets it through refreshThumbnail).
  const alreadySaved = await Reel.exists({ userId, url: normalizedUrl });
  const thumbnailUrl = alreadySaved
    ? null
    : await resolveThumbnail(normalizedUrl);

  // One atomic upsert covers all three cases. When the URL is already in this
  // category the filter matches nothing, so the upsert tries to insert and
  // the unique { userId, url } index rejects it.
  const result = await Reel.findOneAndUpdate(
    { userId, url: normalizedUrl, categoryIds: { $ne: categoryId } },
    {
      $addToSet: { categoryIds: categoryId },
      $setOnInsert: {
        _id: generateId('REEL'),
        title,
        ...(thumbnailUrl && { thumbnailUrl }),
      },
    },
    { upsert: true, returnDocument: 'after', includeResultMetadata: true },
  );

  return {
    reel: result.value,
    created: !result.lastErrorObject?.updatedExisting,
  };
};

// A reel whose lookup just ran isn't looked up again for a while, so a list
// full of expired images (or a page that never has one) can't hammer the
// source site. In memory on purpose: losing it on restart only costs one
// extra lookup per reel.
const THUMBNAIL_RETRY_MS = 10 * 60 * 1000;
const lastThumbnailAttempt = new Map();

const isThumbnailCoolingDown = reelId => {
  const now = Date.now();
  for (const [id, at] of lastThumbnailAttempt) {
    if (now - at >= THUMBNAIL_RETRY_MS) {
      lastThumbnailAttempt.delete(id);
    }
  }
  if (lastThumbnailAttempt.has(reelId)) {
    return true;
  }
  lastThumbnailAttempt.set(reelId, now);
  return false;
};

// Returns null when the reel doesn't exist or belongs to another user.
// A failed lookup keeps the stored URL: the client's image may have failed
// only because the phone was offline.
const refreshThumbnail = async (reelId, userId) => {
  const reel = await Reel.findOne({ _id: reelId, userId });
  if (!reel || isThumbnailCoolingDown(reel.id)) {
    return reel;
  }

  const thumbnailUrl = await resolveThumbnail(reel.url);
  if (thumbnailUrl) {
    reel.thumbnailUrl = thumbnailUrl;
  }
  // Same URL back means nothing changed, so updatedAt must not move.
  if (reel.isModified()) {
    await reel.save();
  }
  return reel;
};

// Takes the reel out of the given categories, or out of all of them when
// categoryIds is absent; a reel left in no category is deleted, the same rule
// deleteCategory follows. Returns null when the reel doesn't exist or belongs
// to another user, otherwise { reel, deleted } with reel as it now stands.
const removeReel = async (reelId, userId, categoryIds) => {
  if (!categoryIds) {
    const reel = await Reel.findOneAndDelete({ _id: reelId, userId });
    return reel && { reel, deleted: true };
  }

  // Atomic $pull so a category added at the same moment isn't lost. The
  // filter only matches when something is actually pulled, so a no-op
  // doesn't bump updatedAt.
  const updated = await Reel.findOneAndUpdate(
    { _id: reelId, userId, categoryIds: { $in: categoryIds } },
    { $pull: { categoryIds: { $in: categoryIds } } },
    { returnDocument: 'after' },
  );
  const reel = updated || (await Reel.findOne({ _id: reelId, userId }));
  if (!reel) {
    return null;
  }
  if (reel.categoryIds.length === 0) {
    await Reel.deleteOne({ _id: reelId, userId, categoryIds: { $size: 0 } });
    return { reel, deleted: true };
  }
  return { reel, deleted: false };
};

module.exports = {
  getReels,
  createReel,
  refreshThumbnail,
  removeReel,
  ReelDailyLimitError,
  MAX_DAILY_REELS,
};
