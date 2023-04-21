const express = require('express');
const { isValidObjectId } = require('mongoose');
const { createCategory, deleteCategory } = require('../controllers/category');
const factory = require('../controllers/handlerFactory');
const { protect, authorize } = require('../middleware/auth');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router
  .route('/categories')
  .get(factory.getAll(Category))
  .post(protect, authorize('admin'), createCategory);

router
  .route('/categories/:id')
  .get(factory.getSingleOne(Category))
  .patch(protect, authorize('admin'), factory.updateOne(Category))
  .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
