const asyncHandler = require('../utils/asyncHandler');
const categoryService = require('../services/category.service');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
  );

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: 'Category not found' });
  }

  res.status(200).json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id);

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: 'Category not found' });
  }

  res.status(200).json({ success: true, data: category });
});

const reorderCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.reorderCategories(req.body.order);
  res.status(200).json({ success: true, data: categories });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
