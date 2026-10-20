const Category = require('../models/Category');
const generateId = require('../utils/generateId');

const getAllCategories = async userId => {
  return Category.find({ userId }).sort({ position: 1 });
};

const createCategory = async ({ title, icon }, userId) => {
  const lastCategory = await Category.findOne({ userId }).sort({ position: -1 });
  const position = lastCategory ? lastCategory.position + 1 : 0;
  const id = generateId('CATE');

  return Category.create({ _id: id, title, icon, position, userId });
};

const updateCategory = async (id, updates, userId) => {
  return Category.findOneAndUpdate({ _id: id, userId }, updates, {
    new: true,
    runValidators: true,
  });
};

const deleteCategory = async (id, userId) => {
  return Category.findOneAndDelete({ _id: id, userId });
};

const reorderCategories = async (order, userId) => {
  const bulkOps = order.map((id, index) => ({
    updateOne: {
      filter: { _id: id, userId },
      update: { position: index },
    },
  }));

  await Category.bulkWrite(bulkOps);
  return getAllCategories(userId);
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
