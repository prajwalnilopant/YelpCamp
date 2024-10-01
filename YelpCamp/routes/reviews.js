const express = require('express');
const router = express.Router({ mergeParams: true }); //You must pass {mergeParams: true} to the child router if you want to access the params from the parent router. i.e. to get the id from "app.js" to "reviews.js"
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const { reviewSchema } = require('../schemas.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview)); //reviews.createReview refers to the controller in the controllers directory.
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
