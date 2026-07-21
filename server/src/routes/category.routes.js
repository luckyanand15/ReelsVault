const express = require('express');
const validate = require('../middleware/validation.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  idParamSchema,
} = require('../validators/category.validator');
const controller = require('../controllers/category.controller');

const router = express.Router();

router.get('/', controller.getCategories);
router.post('/', validate(createCategorySchema), controller.createCategory);
router.patch(
  '/reorder',
  validate(reorderCategoriesSchema),
  controller.reorderCategories,
);
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema),
  controller.updateCategory,
);
router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  controller.deleteCategory,
);

module.exports = router;
