const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Reel URL is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Reel title is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Reel', ReelSchema);
