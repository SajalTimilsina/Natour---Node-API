const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const fs = require('fs');

const router = express.Router(); // mounting a new app in  the routes
// making special route bcz user is different from other, it has authcontroller

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// will authenticate after this point
router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
