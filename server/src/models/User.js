const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongooseIdPlugin = require('../utils/mongooseIdPlugin');

const SALT_ROUNDS = 12;

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
    // select: false keeps it out of queries unless explicitly requested.
    password: {
      type: String,
      required: true,
      select: false,
    },
    // Access tokens issued before this are rejected (see requireAuth), so a
    // password reset ends every session, not just the refreshable ones.
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.plugin(mongooseIdPlugin);

module.exports = mongoose.model('User', userSchema);
