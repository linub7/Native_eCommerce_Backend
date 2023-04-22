const asyncHandler = require('../middleware/async');
const AppError = require('../utils/AppError');
const Category = require('../models/Category');
const Product = require('../models/Product');
const {
  uploadImageToCloudinary,
  destroyImageFromCloudinary,
} = require('../utils/imageUpload');

exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    body: { name, description, stock, price, category },
  } = req;

  const isValidCategory = await Category.findById(category);
  if (!isValidCategory)
    return next(new AppError('Please provide a valid category', 404));

  let photos = [];

  if (req.files) {
    for (const file of req.files) {
      const path = file && file.path;
      const { url, public_id } = await uploadImageToCloudinary(path);
      photos.push({ url, public_id });
    }
  }

  const newProduct = await Product.create({
    name,
    description,
    category,
    photos,
    price,
    stock,
  });

  return res.json({ status: 'success', data: { data: newProduct } });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const {
    body,
    params: { id },
  } = req;

  const existedProduct = await Product.findById(id);
  if (!existedProduct) return next(new AppError('Product was not found', 404));

  if (body.category) {
    const isValidCategory = await Category.findById(body?.category);
    if (!isValidCategory)
      return next(new AppError('Please provide a valid category', 400));
  }

  let photosArray = [];

  for (const element of existedProduct.photos) {
    const publicId = element.public_id;
    console.log({ publicId });
    // const result = await destroyImageFromCloudinary(publicId);

    // if (result !== 'ok') return next(new AppError('Error deleting image', 500));
  }

  existedProduct.name = body.name && body.name;
  existedProduct.description = body.description && body.description;
  existedProduct.price = body.price && body.price;
  existedProduct.stock = body.stock && body.stock;
  existedProduct.category = body.category && body.category;
  // existedProduct.photos =
  //   photosArray.length > 0 ? photosArray : existedProduct.photos;

  await existedProduct.save();

  return res.json({
    status: 'success',
    data: {
      data: existedProduct,
    },
  });
});

exports.addProductImages = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  let photosArray = [];

  if (!req.files || req.files.length < 1)
    return next(new AppError('You have to provide at least one image', 400));

  for (const file of req.files) {
    const path = file && file.path;
    const { url, public_id } = await uploadImageToCloudinary(path);
    photosArray.push({ url, public_id });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $push: {
        photos: { $each: photosArray },
      },
    },
    { new: true }
  );

  return res.json({
    status: 'success',
    data: { data: updatedProduct },
  });
});

exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const {
    params: { id, publicId },
  } = req;

  const result = await destroyImageFromCloudinary(publicId);
  if (result !== 'ok') return next(new AppError('Error deleting image', 500));

  await Product.updateOne(
    { _id: id.toString() },
    { $pull: { photos: { public_id: publicId } } },
    { new: true }
  );

  return res.json({
    status: 'success',
    data: { data: 'Images deleted successfully' },
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const {
    params: { id },
  } = req;

  const existedProduct = await Product.findById(id);
  if (!existedProduct) return next(new AppError('Product not found', 404));

  for (let index = 0; index < existedProduct.length; index++) {
    await destroyImageFromCloudinary(existedProduct.photos[index].public_id);
  }

  await existedProduct.remove();

  return res.json({
    status: 'success',
    data: { data: 'product deleted successfully' },
  });
});
