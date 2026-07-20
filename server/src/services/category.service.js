const Category = require('../models/Category');

const getAllCategories = async () => {
  return Category.find().sort({ position: 1 });
};

const createCategory = async ({ title, icon }) => {
  const lastCategory = await Category.findOne().sort({ position: -1 });
  const position = lastCategory ? lastCategory.position + 1 : 0;

  return Category.create({ title, icon, position });
};

const updateCategory = async (id, updates) => {
  return Category.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
};

const deleteCategory = async id => {
  return Category.findByIdAndDelete(id);
};

const reorderCategories = async order => {
  const bulkOps = order.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { position: index },
    },
  }));

  await Category.bulkWrite(bulkOps);
  return getAllCategories();
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
