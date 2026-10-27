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
    categoryId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

reelSchema.index({ userId: 1, createdAt: -1 });
// One copy of each reel per user; urls are normalized before saving.
reelSchema.index({ userId: 1, url: 1 }, { unique: true });

reelSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('Reel', reelSchema);
