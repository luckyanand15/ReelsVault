const Joi = require('joi');

const createCategorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(30).required(),
  icon: Joi.string().trim().min(1).max(10).required(),
});

const updateCategorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(30),
  icon: Joi.string().trim().min(1).max(10),
}).min(1);

// Legacy counter IDs (CAT12) and current generateId IDs
// (CATE + YYYYMMDDHHmmss + 8 hex, e.g. CATE20261020143005A7F3C91E).
const categoryIdSchema = Joi.string().pattern(/^(CAT\d+|CATE\d{14}[0-9A-F]{8})$/);

const reorderCategoriesSchema = Joi.object({
  order: Joi.array().items(categoryIdSchema).min(1).required(),
});

const idParamSchema = Joi.object({
  id: categoryIdSchema.required(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  idParamSchema,
  categoryIdSchema,
};
