const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  //console.log(token);
  createSendToken(newUser, 201, res);
  //   res.status(201).json({
  //     status: 'success',
  //     token,
  //     data: {
  //       user: newUser,
  //     },
  //   });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  // 2. check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password'); // explicitly select password

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3. if everything is ok, send token to client
  const token = signToken(user._id);
  createSendToken(user, 201, res);
  //   res.status(201).json({
  //     status: 'success',
  //     token,
  //   });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting the token and check if it exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError('You are not authorized to access this route', 401)
    );
  }
  // 2) Check if the token is valid or not
  // payload is user ID
  // verify is async function
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);
  // 3) check if user still exist or not
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belong to this token doesnot exit', 401)
    );
  }
  //4) Check if user changed password after the JWT Token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password', 401));
  }
  req.user = freshUser;
  next(); // if everything is ok, go to the next middleware
  //GRANT ACCESS TO PROTECTED ROUTE
});

// we create a wrapper functon to receive in middleware which return the function
exports.restrictTo = (...roles) => {
  // we cannot receive passing arguments in middleware
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to access this route', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email', 404));
  }

  // 2. generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // deactivate the validator before saving

  // 3. Send it to user as email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? Click on the following link to reset your password: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token. Valid for 10 minutes',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.createPasswordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError('Email could not be sent', 500));
  }
});

exports.resetPassword = async (req, res, next) => {
  //1. Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2. If token has not expire and there is a user set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // always user save because we want to run middleware and validators
  //3. Update the changedPasswordAt property for the user

  //4. Log the user in, send JWT
  const token = signToken(user._id);
  createSendToken(user, 200, res);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. Get user from the collection
  // This feature will run after middleware and valdators so we don't need to check if the user has email password or not
  // this has added req.user data to pass along with middleware so we can access them, no need from req.body.email
  const user = await User.findById(req.user.id).select('+password');

  console.log(req);
  //2. Check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }
  //3. Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // user.passwordChangedAt = Date.now(); // we have a middleware for this User.('pre)
  // user.passwordResetToken = undefined;
  // user.passwordResetExpires = undefined;
  await user.save();

  //4. Log the user in, send JWT
  createSendToken(user, 200, res);
  // res.status(200).json({
  //   status: 'success',
  //   message: 'Password updated successfully',
  //   token,
  // });
});
