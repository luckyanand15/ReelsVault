const mongoose = require('mongoose');
const mongooseIdPlugin = require('../utils/mongooseIdPlugin');
const { normalizeText } = require('../utils/searchText');

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
    // title as search compares it (see utils/searchText); kept in step with
    // title by the hook below.
    titleNormalized: {
      type: String,
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

// Runs for create, save and insertMany alike. Only a changed title touches
// it, so an unchanged save still writes nothing.
savedReelSchema.pre('validate', function setTitleNormalized() {
  if (this.isNew || this.isModified('title')) {
    this.titleNormalized = normalizeText(this.title);
  }
});

savedReelSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('SavedReel', savedReelSchema);
