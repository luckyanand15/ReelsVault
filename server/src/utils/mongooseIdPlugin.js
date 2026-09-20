const transform = (_doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  return ret;
};

const mongooseIdPlugin = schema => {
  schema.set('versionKey', false);
  schema.set('toJSON', { virtuals: true, transform });
  schema.set('toObject', { virtuals: true, transform });
};

module.exports = mongooseIdPlugin;
