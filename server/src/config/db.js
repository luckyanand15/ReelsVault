const mongoose = require('mongoose');
const LoginAttempt = require('../models/LoginAttempt');
const Reel = require('../models/Reel');
const SavedReel = require('../models/SavedReel');
const { normalizeText } = require('../utils/searchText');

// Saves from before search have no titleNormalized, so search can't find
// them. Normalizing is done in JS, so this fills them in batches through the
// raw collection, which leaves updatedAt alone; a no-op once all have it.
const backfillTitleNormalized = async () => {
  const BATCH = 500;
  for (;;) {
    const docs = await SavedReel.collection
      .find({ titleNormalized: { $exists: false } }, { projection: { title: 1 } })
      .limit(BATCH)
      .toArray();
    if (docs.length === 0) {
      return;
    }
    await SavedReel.collection.bulkWrite(
      docs.map(d => ({
        updateOne: {
          filter: { _id: d._id },
          update: { $set: { titleNormalized: normalizeText(d.title) } },
        },
      })),
    );
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.atlas_URL);
    console.log('MongoDB connected');

    // autoIndex only adds indexes, never drops them. The old unique index on
    // email alone would reject a second IP's record for the same email, so
    // drop it in favour of the email + IP one.
    await LoginAttempt.syncIndexes();

    // Reels used to hold a single categoryId. Through the raw collection so
    // the migration bypasses the schema and leaves updatedAt alone; it's a
    // no-op once every reel has been moved over.
    await Reel.collection.updateMany({ categoryId: { $exists: true } }, [
      { $set: { categoryIds: ['$categoryId'] } },
      { $unset: 'categoryId' },
    ]);

    await backfillTitleNormalized();
  } catch (error) {
    // console.error('MongoDB connection error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
