const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const Order = require('../models/Order');
const Product = require('../models/Product');
// const stripe = require('stripe')(process.env.STRIPE_API_SECRET);

// exports.processPayment = asyncHandler(async (req, res, next) => {
//   const {
//     body: { totalAmount },
//   } = req;
//   const { client_secret } = await stripe.paymentIntents.create({
//     amount: Number(totalAmount * 100),
//     currency: 'usd',
//     automatic_payment_methods: { enabled: true },
//   });
//   // const { client_secret } = await stripe.paymentIntents.create({
//   //   amount: Number(totalAmount * 100),
//   //   currency: 'usd',
//   // });

//   return res.status({
//     status: 'success',
//     data: { data: client_secret },
//   });
// });

exports.getAllAdminOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({});
  return res.json({
    status: 'success',
    data: { data: orders },
  });
});

exports.placeOrder = asyncHandler(async (req, res, next) => {
  const {
    user,
    body: { orderItems, taxPrice, shippingCharges },
  } = req;

  let calculateItemsPrice = 0;

  for (let index = 0; index < orderItems.length; index++) {
    const element = orderItems[index];
    const products = await Product.find({ _id: element.product }).select(
      'price'
    );
    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      calculateItemsPrice += item.price * element.quantity;
    }
  }
  const calculateTotalAmount = calculateItemsPrice + shippingCharges + taxPrice;
  console.log({ calculateTotalAmount, calculateItemsPrice });

  const newOrder = await Order.create({
    user: user._id,
    shippingInfo: {
      address: user.address,
      city: user.city,
      country: user.country,
      pinCode: user.pinCode,
    },
    orderItems,
    itemsPrice: calculateItemsPrice,
    taxPrice,
    shippingCharges,
    totalAmount: calculateTotalAmount,
  });

  for (let index = 0; index < orderItems.length; index++) {
    const element = orderItems[index];
    const product = await Product.findById(element.product);
    product.stock -= element.quantity;
    await product.save();
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: newOrder,
    },
  });
});

exports.getSingleUserOrders = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    user,
  } = req;
  const condition =
    user.role !== 'admin'
      ? { _id: id.toString(), user: user._id }
      : { _id: id.toString() };

  console.log({ condition });

  const order = await Order.findOne(condition);

  if (!order) return next(new AppError('Order was not found', 404));
  return res.json({
    status: 'success',
    data: { data: order },
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
    body: { orderStatus },
  } = req;

  const order = await Order.findById(id);
  if (!order) return next(new AppError('Order was not found', 404));

  if (order.orderStatus === 'Delivered')
    return next(new AppError('order already delivered', 400));

  order.orderStatus = orderStatus;
  order.deliveredAt =
    orderStatus === 'Delivered' ? new Date(Date.now()) : undefined;

  await order.save({ validateBeforeSave: false });

  return res.json({
    status: 'success',
    data: { data: order },
  });
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const {
    user: { _id },
  } = req;

  const myOrders = await Order.find({ user: _id });

  return res.json({
    status: 'success',
    data: { data: myOrders },
  });
});
