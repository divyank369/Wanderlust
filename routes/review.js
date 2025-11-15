const express = require('express');
const router = express.Router({ mergeParams: true }); // ✅ mergeParams allows access to :id from parent route
const wrapAsync = require("../utils/wrapAsync"); 
const { validateReview, isLoggedIn ,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js");



// ✅ Create Review Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// ✅ Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor, 
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
