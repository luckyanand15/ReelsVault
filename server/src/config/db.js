const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.atlas_URL);
    console.log('MongoDB connected');
  } catch (error) {
    // console.error('MongoDB connection error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
