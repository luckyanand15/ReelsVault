const mongoose = require('mongoose');
const LoginAttempt = require('../models/LoginAttempt');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.atlas_URL);
    console.log('MongoDB connected');

    // autoIndex only adds indexes, never drops them. The old unique index on
    // email alone would reject a second IP's record for the same email, so
    // drop it in favour of the email + IP one.
    await LoginAttempt.syncIndexes();
  } catch (error) {
    // console.error('MongoDB connection error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
