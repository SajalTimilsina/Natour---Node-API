const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photos: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    defaut: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a passwordConfirm'],
    validate: {
      /// This only works on CREATE AND SAVE!!!
      validator: function (el) {
        // we cannot use arrow function bcz we need to use this
        return el === this.password;
      },
      message: 'Password does not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

// it run in between receiving data and saving it to database
userSchema.pre('save', async function (next) {
  // Only run this function if password is modified
  if (!this.isModified('password')) return next();
  //first solve and encrypt the password bcrypt
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('/^find', function (next) {
  //this points to query
  // want to send only active users
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', function (next) {
  //when we change passwordChangeAt --- when we modifed
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // Saving to DB is slower then issuing a JWT token,
  // this date we compare with the JWT token timestamp, thats why we made it 1 second less
  next();
});

// related to data thats why done in models
userSchema.methods.correctPassword = async function (
  canidatePassword,
  userPassword
) {
  return await bcrypt.compare(canidatePassword, userPassword); // text, hash Password from DB
};

// create a instance if the password is changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  console.log('Reached a changed Password After function');
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //100 < 200 (time changed after token was issued)
  }
  return false; // means NOT changed
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); //
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes - 10 min * 60 seconds * 1000 milliseconds

  return resetToken; // not encrypted password
};

//Creating a model
const User = mongoose.model('User', userSchema);
module.exports = User;

// name, email, photos, password, passwordConfirm
