const Joi = require('joi');
const { categoryIdSchema } = require('./category.validator');

const createReelSchema = Joi.object({
  categoryId: categoryIdSchema.required(),
  title: Joi.string().trim().min(1).max(100).required(),
  url: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(2048)
    .required(),
});

module.exports = {
  createReelSchema,
};
