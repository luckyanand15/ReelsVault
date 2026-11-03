const mongoose = require('mongoose');
const LoginAttempt = require('../models/LoginAttempt');
const Reel = require('../models/Reel');

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
  } catch (error) {
    // console.error('MongoDB connection error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
