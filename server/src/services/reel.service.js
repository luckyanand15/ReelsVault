const Reel = require('../models/Reel');
const SavedReel = require('../models/SavedReel');
const Category = require('../models/Category');
const generateId = require('../utils/generateId');
const normalizeUrl = require('../utils/normalizeUrl');
const resolveThumbnail = require('../utils/resolveThumbnail');

const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_REELS = 200;

class ReelCategoryNotFoundError extends Error {}

class ReelDailyLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

// The reels as the client gets them: each with its categories (oldest save
// first, so the first is where it was saved originally) and their ids.
const withCategories = async reels => {
  const saves = await SavedReel.find({ reelId: { $in: reels.map(r => r.id) } })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  return reels.map(reel => {
    const categories = saves
      .filter(s => s.reelId === reel.id)
      .map(({ categoryId, title, createdAt }) => ({
        categoryId,
        title,
        createdAt,
      }));
    return {
      ...reel.toJSON(),
      categories,
      categoryIds: categories.map(c => c.categoryId),
    };
  });
};

// Newest first, with _id settling ties in the same millisecond. createdAt +
// id are the last item the client has; the page continues right after it,
// so a reel added mid-scroll can't shift the next page the way skip() would.
const pageFilter = (filter, createdAt, id) =>
  createdAt
    ? {
        ...filter,
        $or: [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: id } }],
      }
    : filter;

// One page of reels. Under All the order is when each reel was first saved;
// in a category it's when the reel was added to that category, so the
// cursor there is the save's. nextCursor is the pair to send for the
// following page, null on the last one.
const getReels = async (userId, { categoryId, createdAt, id, limit }) => {
  // One extra tells whether another page exists.
  const Model = categoryId ? SavedReel : Reel;
  const filter = categoryId ? { userId, categoryId } : { userId };
  const found = await Model.find(pageFilter(filter, createdAt, id))
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);
  const page = found.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor =
    found.length > limit ? { createdAt: last.createdAt, id: last.id } : null;

  if (!categoryId) {
    return { reels: await withCategories(page), nextCursor };
  }
  const reelIds = page.map(s => s.reelId);
  const reels = await Reel.find({ _id: { $in: reelIds }, userId });
  const byId = new Map(reels.map(r => [r.id, r]));
  const ordered = reelIds.map(rid => byId.get(rid)).filter(Boolean);
  return { reels: await withCategories(ordered), nextCursor };
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
// is saved in this category too (with this title) instead of a second copy.
// Throws ReelDailyLimitError past MAX_DAILY_REELS, and a duplicate key error
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

  // Upsert so two saves of a new URL at once still make one reel.
  const result = await Reel.findOneAndUpdate(
    { userId, url: normalizedUrl },
    {
      $setOnInsert: {
        _id: generateId('REEL'),
        ...(thumbnailUrl && { thumbnailUrl }),
      },
    },
    { upsert: true, returnDocument: 'after', includeResultMetadata: true },
  );
  const reel = result.value;
  const created = !result.lastErrorObject?.updatedExisting;

  // The unique { reelId, categoryId } index rejects a second save in the same
  // category. A reel just made for a save that failed is removed again, so
  // none is left in no category, unless a request saving the same URL at
  // the same moment has saved it meanwhile.
  try {
    await SavedReel.create({
      _id: generateId('SAVE'),
      reelId: reel.id,
      categoryId,
      title,
      userId,
    });
  } catch (err) {
    if (created && !(await SavedReel.exists({ reelId: reel.id }))) {
      await Reel.deleteOne({ _id: reel.id, userId });
    }
    throw err;
  }

  const [withSaves] = await withCategories([reel]);
  return { reel: withSaves, created };
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
  if (!reel) {
    return null;
  }
  if (!isThumbnailCoolingDown(reel.id)) {
    const thumbnailUrl = await resolveThumbnail(reel.url);
    if (thumbnailUrl) {
      reel.thumbnailUrl = thumbnailUrl;
    }
    // Same URL back means nothing changed, so updatedAt must not move.
    if (reel.isModified()) {
      await reel.save();
    }
  }
  const [withSaves] = await withCategories([reel]);
  return withSaves;
};

// Changes the title and/or replaces the reel's categories. The title is the
// one in categoryId (the category being viewed), or the first category's
// when that's absent or the reel isn't in it; newly added categories start
// with it too, while kept ones keep their own. Returns null when the reel
// doesn't exist or belongs to another user; throws ReelCategoryNotFoundError
// when a category isn't the user's. Only saves that really change are
// written, so updatedAt keeps meaning "last edited".
const updateReel = async (
  reelId,
  userId,
  { title, categoryId, categoryIds },
) => {
  if (categoryIds) {
    const found = await Category.countDocuments({
      _id: { $in: categoryIds },
      userId,
    });
    if (found !== categoryIds.length) {
      throw new ReelCategoryNotFoundError('Category not found');
    }
  }

  const reel = await Reel.findOne({ _id: reelId, userId });
  if (!reel) {
    return null;
  }

  let saves = await SavedReel.find({ reelId }).sort({ createdAt: 1, _id: 1 });
  if (saves.length === 0) {
    return null;
  }
  const entryFor = () =>
    saves.find(s => s.categoryId === categoryId) || saves[0];
  const newTitle = title ?? entryFor().title;

  // New categories are added before old ones are removed, so the reel is
  // never left in none (deleteCategory would delete it then).
  if (categoryIds) {
    const current = saves.map(s => s.categoryId);
    const added = categoryIds
      .filter(id => !current.includes(id))
      .map(id => ({
        _id: generateId('SAVE'),
        reelId,
        categoryId: id,
        title: newTitle,
        userId,
      }));
    const removed = current.filter(id => !categoryIds.includes(id));
    if (added.length > 0) {
      await SavedReel.insertMany(added);
    }
    if (removed.length > 0) {
      await SavedReel.deleteMany({ reelId, categoryId: { $in: removed } });
    }
    saves = [
      ...saves.filter(s => !removed.includes(s.categoryId)),
      ...added.map(a => new SavedReel(a)),
    ];
  }

  const entry = entryFor();
  if (title !== undefined && entry.title !== title) {
    entry.title = title;
    await entry.save();
  }

  const [withSaves] = await withCategories([reel]);
  return withSaves;
};

// Takes the reel out of the given categories, or out of all of them when
// categoryIds is absent; a reel left in no category is deleted, the same rule
// deleteCategory follows. Returns null when the reel doesn't exist or belongs
// to another user, otherwise { reel, deleted } with reel as it now stands.
const removeReel = async (reelId, userId, categoryIds) => {
  const reel = await Reel.findOne({ _id: reelId, userId });
  if (!reel) {
    return null;
  }

  await SavedReel.deleteMany({
    reelId,
    ...(categoryIds && { categoryId: { $in: categoryIds } }),
  });
  const [withSaves] = await withCategories([reel]);
  if (withSaves.categories.length > 0) {
    return { reel: withSaves, deleted: false };
  }
  await Reel.deleteOne({ _id: reelId, userId });
  return { reel: withSaves, deleted: true };
};

module.exports = {
  getReels,
  createReel,
  refreshThumbnail,
  updateReel,
  removeReel,
  ReelCategoryNotFoundError,
  ReelDailyLimitError,
  MAX_DAILY_REELS,
};
