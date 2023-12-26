const express = require('express');
const Tour = require('./../models/tourModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTour = (req, res, next) => {
  // pre-filling the query string with alising/ middleware so user doesnot have to do it
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE THE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query; // after building the query, we will execute and await for responce
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
// I am confuse why there is path
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   //populate field name is reviews: from virtual
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   if (!tour) {
//     return next(
//       new AppError(`Cannot find tour with id of ${req.params.id}`, 404)
//     );
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// we wrap the asycn function and pass to catchAsync
exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

//this work because of closures
// the inner function will get access to variables of outer function, even if the variables are returned
// Calling deleteOne will come and sit here until the corresponding router will hit the endpoints
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // updating only those values that have changed

//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(
//       new AppError(`Cannot find tour with id of ${req.params.id}`, 404)
//     );
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getAllUsers = async (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not define',
  });
};

// Busiest Month of the year
//By calculating: how many tours start each month of the year/ Hiring tour guide, buying equipment

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // this allow to group document by using accumulator:
        _id: { $toUpper: '$difficulty' }, // how we want to group document, example: difficulty,
        num: { $sum: 1 }, // each of the documents, it will go through this pipeline, it will keep adding
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$pirce' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // at this point the avbove data are alredy changed, the output of group is now our document,
    }, // we take avgPrice from that document and 1= assending order sorting

    // {
    //   $match: { _id: { $ne: 'EASY' } }, // using multiple match, not easy
    // },
  ]); // each element in this array is a stages

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates', // deconstruct the data from input documents and output one documents for each element for the array
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`2021-01-01`),
            $lte: new Date(`2021-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }, // creating array: each documents will go through this pipeline: name field of the tours
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 }, // starting with highest number of tour starts
      },
      {
        $limit: 12, // limit the results
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failure',
      message: err.message,
    });
  }
};
