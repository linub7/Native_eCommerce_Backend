const mongoose = require('mongoose');

const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: [true, 'please provide an address'],
      },
      city: {
        type: String,
        required: [true, 'please provide a city'],
      },
      country: {
        type: String,
        required: [true, 'please provide a country'],
      },
      pinCode: {
        type: Number,
        required: [true, 'please provide a pin code'],
      },
    },
    orderItems: [
      {
        name: { type: String, required: [true, 'please provide order name'] },
        price: { type: String, required: [true, 'please provide order price'] },
        quantity: {
          type: Number,
          required: [true, 'please provide order quantity'],
        },
        image: {
          type: String,
          required: [true, 'please provide order item photo'],
        },
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    paidAt: {
      type: Date,
      default: Date.now(),
    },
    paymentInfo: {
      id: String,
      status: String,
    },
    itemsPrice: {
      type: Number,
      required: [true, 'Please provide itemsPrice'],
    },
    taxPrice: {
      type: Number,
      required: [true, 'Please provide taxPrice'],
    },
    shippingCharges: {
      type: Number,
      required: [true, 'Please provide shippingCharges'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please provide totalAmount'],
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Delivered', 'Shipped', 'Cancelled'],
      default: 'Processing',
    },
    deliveredAt: {
      type: Date,
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will now show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

OrderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  this.populate({
    path: 'orderItems.product',
    select: 'name',
  });
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
