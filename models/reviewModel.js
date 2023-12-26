/// review /rating / createAt / ref to tour / ref to user
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModels');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    // when we dont know how much it can grow
    // both parents user and  tour
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to the tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to the user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }, // calculated field also show up in output
    // we are adding implicitly
  }
);

//QUERY MIDDLEWARE

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   // field 1: Tours
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo', // we are stopping to flood user data in a request.
  // });
  this.populate({
    path: 'user',
    select: 'name photo', // we are stopping to flood user data in a request.
  });
  next();
});

//Static methods
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // Calling directly on current model
  //this will run each time when review is added
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);
  // we are saving the current stats to tour
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  //this point the current document to save
  //Review.calcAverageRatings(this.tour); // we cannnot call Review after we setup the instance, .pre('save) will not run
  this.constructor.calcAverageRatings(this.tour);
  //next(); - post doesnot get access to next
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
// POST /tour/123hs2/reviews
// GET  /tour/123hs2/reviews
// GET /tour/123hs2/reviews/9876f1
