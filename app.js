//This file will have middleware
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1. Middleware ----------------------------------------------------

// GLOBAL middleware
//Set Security HTTP headers

app.use(helmet());

const limiter = rateLimit({
  // 100 requests per 1 hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter); // we are applying the rate limiter to all under /api

//Body parser, reading data from body into re.body
app.use(express.json({ limit: '10kb' })); // middleware to modify incoming data

//Date sanitization middleware against NoSql injections
app.use(mongoSanitize());
// Data sanitization against XSS attacks

app.use(xss());
app.use(
  hpp({
    whitelist: ['duration'],
  })
); // prevent parameter pollution. Should be done at last as it work with query

//serving static files
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use((req, res, next) => {
//   console.log('running middleware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. Route Handlers--------------------------------------------------

// 3. Routes ----------------------------------------------------------
// Mounting the route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  // req res point reach here means it didnot find the link
  // const err = new Error(`Cannot find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //next(err);
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

// Error Handeling middleware
// app.use((err, req, res, next) => {
//   res.status(err.statusCode || 500).json({
//     status: err.status || 'failure',
//     message: err.message,
//   });
// });

app.use(globalErrorHandler); // exceptional errors
//4. Server----------------------
module.exports = app;
