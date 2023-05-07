/* eslint-disable camelcase */
const cloudinary = require('../cloud');
const DataUriParser = require('datauri/parser');
const path = require('path');

exports.uploadImageToCloudinary = async (filePath) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    filePath
  );
  return { url, public_id };
};

exports.destroyImageFromCloudinary = async (public_id) => {
  const { result } = await cloudinary.uploader.destroy(public_id);
  console.log('destroy image result: ', result);

  return result;
};

exports.getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};
