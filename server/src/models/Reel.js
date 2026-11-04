const mongoose = require('mongoose');
const mongooseIdPlugin = require('../utils/mongooseIdPlugin');

const reelSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    // Remote preview image; never the image itself. Instagram/TikTok URLs
    // are signed and expire, so the client asks for a refresh when one stops
    // loading. Absent when no thumbnail could be found.
    thumbnailUrl: {
      type: String,
    },
    // A reel saved to several categories is one document listing them all.
    categoryIds: {
      type: [String],
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// One copy of each reel per user; urls are normalized before saving.
reelSchema.index({ userId: 1, url: 1 }, { unique: true });
// Paged reel lists, all reels and per category (newest first). The first
// also serves the daily-limit count.
reelSchema.index({ userId: 1, createdAt: -1, _id: -1 });
reelSchema.index({ userId: 1, categoryIds: 1, createdAt: -1, _id: -1 });

reelSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('Reel', reelSchema);
