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

const reelIdSchema = Joi.string().pattern(/^REEL\d{14}[0-9A-F]{8}$/);

const reelIdParamSchema = Joi.object({
  id: reelIdSchema.required(),
});

const listReelsQuerySchema = Joi.object({
  categoryId: categoryIdSchema,
  // The last reel the client has (from nextCursor); sent together or not at
  // all. id accepts any format, so changing how ids are made can't break it.
  createdAt: Joi.date().iso(),
  id: Joi.string().trim().max(100),
  limit: Joi.number().integer().min(1).max(50).default(15),
}).and('createdAt', 'id');

module.exports = {
  createReelSchema,
  reelIdParamSchema,
  listReelsQuerySchema,
};
