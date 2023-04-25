const express = require('express');
const { isValidObjectId } = require('mongoose');
const {
  getAllAdminOrders,
  placeOrder,
  getSingleUserOrders,
  updateOrderStatus,
  getMyOrders,
} = require('../controllers/order');
const factory = require('../controllers/handlerFactory');
const { protect, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return next(new AppError('Please provide a valid id', 400));
  }
  next();
});

router.route('/orders/me').get(protect, getMyOrders);

router
  .route('/orders')
  .get(protect, authorize('admin'), getAllAdminOrders)
  .post(protect, placeOrder);

router
  .route('/orders/:id')
  .get(protect, getSingleUserOrders)
  .patch(protect, authorize('admin'), updateOrderStatus)
  .delete(protect, authorize('admin'), factory.deleteOne(Order));

module.exports = router;
