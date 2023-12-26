const fs = require('fs');
const AppError = require('./../utils/appError');
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not define!  Please use Signup instead',
  });
};

exports.updateMe = async (req, res, next) => {
  // 1. Create eror if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for passwords update', 400));
  }
  // const user = await User.findById(req.user.id);

  //2. FIlter only those fields that are allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3. Update user document
  // we are updating not a sensitive datas we can use findByIAndUpdate
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // user.name = 'Jonas';
  // await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log(req.user.id);
  const message = await User.findByIdAndUpdate(req.user.id, { active: false });
  console.log(message);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
// DONOT update password with this
exports.updateUser = factory.updateOne(User);
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
