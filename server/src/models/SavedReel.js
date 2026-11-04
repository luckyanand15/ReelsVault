const mongoose = require('mongoose');
const mongooseIdPlugin = require('../utils/mongooseIdPlugin');

// A reel saved in one category, with the title it was given there. createdAt
// is when it was added to that category, which orders the category's list.
const savedReelSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    reelId: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// A reel is in a category at most once; also finds a reel's saves.
savedReelSchema.index({ reelId: 1, categoryId: 1 }, { unique: true });
// Paged reel list per category, newest first; also finds a category's saves.
savedReelSchema.index({ userId: 1, categoryId: 1, createdAt: -1, _id: -1 });

savedReelSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('SavedReel', savedReelSchema);
