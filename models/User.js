const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      minlength: [2, 'Name must be more or equal than 2'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    photo: {
      type: Object,
      url: String,
      public_id: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'password must be at least 8 characters'],
      maxlength: [25, 'password must be less that 26 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      minlength: [8, 'password must be at least 8 characters'],
      maxlength: [25, 'password must be less that 26 characters'],
      validate: {
        // this only works on .save() or .create()
        validator: function (val) {
          return val === this.password;
        },
        message: (props) => `${props.value} must be the same password`,
      },
    },
    address: {
      type: String,
      required: [true, 'Please provide a address'],
      minlength: [2, 'address must be more or equal than 2'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      minlength: [2, 'city must be more or equal than 2'],
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      minlength: [2, 'country must be more or equal than 2'],
    },
    pinCode: {
      type: String,
      required: [true, 'Please provide a pinCode'],
      minlength: [5, 'pinCode must be more or equal than 5'],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will now show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // putting passwordChangedAt on second in the past will then ensure that the token is always created
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // we set select:false to password field -> so we can't use this.password and use its value
  // -> so we have to use an argument to represent storedPassword(userPassword)
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // JWTTimestamp in seconds, this.passwordChangedAt.getTime() in milliseconds -> divided by 1000
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; // 100 < 200 -> true -> password changed
  }
  // false means that NOT changed
  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(8).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires in 10 minutes(converted to milliseconds)
  return resetToken;
};

UserSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

module.exports = mongoose.model('User', UserSchema);
