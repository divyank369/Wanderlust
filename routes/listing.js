const express = require('express');
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });  // temp upload
const cloudinary = require("../cloudConfig");

 // Configure multer to use Cloudinary storage

// Index + Create Route (same path "/")
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,
     
     upload.single('listing[image]'), 
     validateListing,
     wrapAsync(listingController.createListing));
 


// New Route (form for creating new listing)//
router.get("/new", isLoggedIn, listingController.renderNewForm);


// Show + Update + Delete Route (same path "/:id")
router.route("/:id")
  .get(wrapAsync(listingController.showListing))  // Show Route
  .put(isLoggedIn, isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))  // Update Route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));  // Delete Route


// Edit Route (form for editing existing listing)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));


module.exports = router;
