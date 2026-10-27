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

// save() instead of findOneAndUpdate: an update query always bumps updatedAt,
// while save() only does when a field actually changed, so createdAt ===
// updatedAt keeps meaning "never edited".
const updateCategory = async (id, updates, userId) => {
  const category = await Category.findOne({ _id: id, userId });
  if (!category) {
    return null;
  }

  category.set(updates);
  if (category.isModified()) {
    await category.save();
  }
  return category;
};

const deleteCategory = async (id, userId) => {
  return Category.findOneAndDelete({ _id: id, userId });
};

const reorderCategories = async (order, userId) => {
  const bulkOps = order.map((id, index) => ({
    updateOne: {
      // Skip categories already in place so their updatedAt isn't bumped.
      filter: { _id: id, userId, position: { $ne: index } },
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
