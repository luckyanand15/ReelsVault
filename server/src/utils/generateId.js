const Counter = require('../models/Counter');

const generateId = async (counterName, prefix) => {
  const counter = await Counter.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `${prefix}${counter.seq}`;
};

module.exports = generateId;
