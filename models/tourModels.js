const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModels');
const Review = require('./reviewModel');

// Creating a schema

const tourSchema = new mongoose.Schema(
  {
    name: {
      // schema object
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name can not be more than 40 characters'],
      minlength: [10, 'A tour name can not be less than 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must contain only alphabets'], // external libary to check the validation
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    // priceDiscount: {
    //   type: Number, // this function just return TRUE or FALSE
    //   validate: function (value) {
    //     // value has an access of that value
    //     return value < this.price;
    //   },
    // },
    priceDiscount: {
      type: Number, // this function just return TRUE or FALSE
      validate: {
        validator: function (value) {
          // this only points to current doc on NEW DOCUMENTS
          // doesnot run onupdates
          return value < this.price;
        },
        message: 'Price discount ({VALUE}) must be less than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an imageCover'],
    },
    images: [String], // array of images as strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    endDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON, we need to ceate object
      type: {
        type: String,
        default: 'Point', // Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection,
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // this will create brand new documents inside parent documents
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  { toJSON: { virtuals: true }, toObjects: { virtuals: true } } // when data get output as JSON, we are adding implicitly: virtuals
); //object for schema options, we need to add virtuals to the schema, giving

tourSchema.index({ price: 1, ratingAverage: -1 }); // 1 is assending order, -1 descending order
tourSchema.index({ slug: 1 });
tourSchema
  .virtual('durationWeeks')
  .get(function () // we use reguarl function bcz we  need this keywords
  {
    return this.duration / 7;
  });

// Tour referencing virtual
// field name is reviews
tourSchema.virtual('reviews', {
  // virtual fields name is reviews and it object {}
  ref: 'Review', // model name
  foreignField: 'tour', // this field is inside review - tour object
  localField: '_id', // where to store the tour, _id is local field to connect with review - tour object
});

//DOCUMENT MIDDLEWARES: runs before .save() and .create() not on insertMany & others

tourSchema.pre('save', function (next) {
  // console.log(this); // this keyword is point to currently processing documents
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Saving document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARES
tourSchema.pre(/^find/, function (next) {
  // find: All the methods start with find method
  // this keyword point to current query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// we do it here instead of putting in all find query if we are populating all find methods
tourSchema.pre(/^find/, function (next) {
  this.populate({
    // this always point to current query
    path: 'guides',
    select: '-__v -passwordChangedAt',
  }); // fillup guides in the tour data - only in the query
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  //console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);

  next();
});

//AGGREGATION MIDDLEWARES - we want not to include secrete documents

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    // unshift to move array in the front
    $match: { secretTour: { $ne: true } },
  });
  //console.log(this.pipeline());
  next();
});

// Creating a model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

//mongooes middleware document can run before or after the event happens
// document, query, aggregation and model midleware
