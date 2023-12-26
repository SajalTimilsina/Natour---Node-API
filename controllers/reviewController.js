const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// create  get

exports.getAllReviews = factory.getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);
//   if (!reviews) {
//     return next(new AppError(' error while getting reviews'));
//   }

//   res.status(200).send({
//     status: 'success',
//     data: {
//       reviews,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // we get from protect middleware
  next();
};

exports.getReviews = factory.getOne(Review);
// This use setTourUserIds from middleware
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
