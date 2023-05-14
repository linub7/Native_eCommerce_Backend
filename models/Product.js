const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Please provide a name'],
      minlength: [2, 'Name must be more or equal than 2'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: [20, 'Description must be more or equal than 2'],
    },
    photos: [
      {
        type: Object,
        url: String,
        public_id: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please provide a stock'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category'],
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will now show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: 'name',
  });
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
