const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = asyncHandler(async (req, res, next) => {
  const {
    body: { name },
  } = req;
  const newCategory = await Category.create({ name });

  return res.status(201).json({
    status: 'success',
    data: {
      data: newCategory,
    },
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  await Product.deleteMany({ category: id });
  await Category.findByIdAndDelete(id);

  return res.json({
    status: 'success',
    data: { data: 'delete successfully' },
  });
});
