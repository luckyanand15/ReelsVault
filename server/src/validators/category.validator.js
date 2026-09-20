const Joi = require('joi');

const createCategorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(30).required(),
  icon: Joi.string().trim().min(1).max(10).required(),
});

const updateCategorySchema = Joi.object({
  title: Joi.string().trim().min(1).max(30),
  icon: Joi.string().trim().min(1).max(10),
}).min(1);

const categoryIdSchema = Joi.string().pattern(/^CAT\d+$/);

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
};
