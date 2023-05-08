const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  createProduct,
  updateProduct,
  addProductImages,
  deleteProductImage,
  deleteProduct,
  getAllAdminProducts,
} = require('../controllers/product');
const factory = require('../controllers/handlerFactory');
const { protect, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { uploadImage } = require('../middleware/multer');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router.get('/products/admin', protect, authorize('admin'), getAllAdminProducts);

router
  .route('/products')
  .get(factory.getAll(Product))
  .post(
    uploadImage.array('photos'),
    protect,
    authorize('admin'),
    createProduct
  );

router
  .route('/products/:id')
  .get(factory.getSingleOne(Product))
  .patch(protect, authorize('admin'), factory.updateOne(Product))
  .delete(protect, authorize('admin'), deleteProduct);

router.patch(
  '/products/:id/add-images',
  uploadImage.array('photos'),
  protect,
  authorize('admin'),
  addProductImages
);

router.patch(
  '/products/:id/delete-image/:publicId',
  protect,
  authorize('admin'),
  deleteProductImage
);

module.exports = router;
