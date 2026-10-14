const mongoose = require('mongoose');
const mongooseIdPlugin = require('../utils/mongooseIdPlugin');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    // Stored as plain text for now — hashing will be added later.
    // select: false keeps it out of queries unless explicitly requested.
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('User', userSchema);
