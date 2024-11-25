const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

// the inner function will get access to variables of outer function, even if the variables are returned
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // updating only those values that have changed

    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`Cannot find document with id of ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // run through schema to validate data
    }); // new means it will return updated data
    if (!doc) {
      return next(
        new AppError(`Cannot find tour with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.create(req.body); // this will return the promise, thatswhy we have asycn function
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    //populate field name is reviews: from virtual
    //const doc = await Model.findById(req.params.id).populate('reviews');
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`Cannot find tour with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE THE QUERY
    //To allow for nested GET reviews on tour (hacks)
    //Filter by ID
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query; // after building the query, we will execute and await for responce

    //const tours = await features.query.explain(); // after building the query, we will execute and await for responce
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  });
