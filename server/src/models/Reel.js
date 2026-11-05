const mongoose = require('mongoose');
const mongooseIdPlugin = require('../utils/mongooseIdPlugin');

// The video itself, stored once per user however many categories it's saved
// in. Each save (category + title) is a SavedReel.
const reelSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
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
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// One copy of each reel per user; urls are normalized before saving.
reelSchema.index({ userId: 1, url: 1 }, { unique: true });
// Paged list of all reels (newest first); also serves the daily-limit count.
reelSchema.index({ userId: 1, createdAt: -1, _id: -1 });

reelSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('Reel', reelSchema);
