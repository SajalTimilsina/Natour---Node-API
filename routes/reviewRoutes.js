const express = require('express');
// this pass params from pass routes to this router and it will goto controllers
const router = express.Router({ mergeParams: true }); // by default each route has access to their params- in order to get access, we are merging the parameters
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReviews)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
