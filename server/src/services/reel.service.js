const Reel = require('../models/Reel');
const Category = require('../models/Category');
const generateId = require('../utils/generateId');

const getAllReels = async userId => {
  return Reel.find({ userId }).sort({ createdAt: -1 });
};

// Returns null when the category doesn't exist or belongs to another user.
const createReel = async ({ categoryId, title, url }, userId) => {
  const categoryExists = await Category.exists({ _id: categoryId, userId });
  if (!categoryExists) {
    return null;
  }

  return Reel.create({ _id: generateId('REEL'), title, url, categoryId, userId });
};

module.exports = {
  getAllReels,
  createReel,
};
