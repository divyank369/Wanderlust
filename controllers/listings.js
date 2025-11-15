const Listing = require("../models/listing");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // ✅ For API call

const mapToken = process.env.MAP_TOKEN; // From .env file

// 🌍 Helper function - MapTiler Forward Geocoding
async function getCoordinates(location) {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${mapToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
        return data.features[0].geometry; // { type: 'Point', coordinates: [lng, lat] }
    } else {
        throw new Error("No geocoding results found");
    }
}

// ----------------------------
// Index Route
// ----------------------------
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// ----------------------------
// New Form Route
// ----------------------------
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// ----------------------------
// Show Route
// ----------------------------
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// ----------------------------
// ✅ Create Route (with MapTiler Geocoding)
// ----------------------------
module.exports.createListing = async (req, res) => {
    try {
        // Get location from form input
        const location = req.body.listing.location;

        // Forward Geocode to get coordinates
        const geoData = await getCoordinates(location);
        console.log("📍 GeoData:", geoData);

        // Image handling
        let url = req.file.path;
        let filename = req.file.filename;

        // Create new listing
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        // ✅ Add geometry from MapTiler geocoding
        newListing.geometry = geoData;

        let savedListing = await newListing.save();
        console.log("✅ New Listing Created:", savedListing);
        req.flash("success", "New Listing Created Successfully!");
        res.redirect(`/listings/${savedListing._id}`);
    } catch (err) {
        console.error("❌ Geocoding Error:", err);
        req.flash("error", "Error creating listing. Please try again.");
        res.redirect("/listings/new");
    }
};

// ----------------------------
// Edit Route
// ----------------------------
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ----------------------------
// Update Route
// ----------------------------
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // STEP 1: Update listing basic fields
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // STEP 2: If location was edited → regenerate new coordinates
    if (req.body.listing.location) {
        try {
            const newGeoData = await getCoordinates(req.body.listing.location);
            listing.geometry = newGeoData; // update coordinates
        } catch (err) {
            console.error("❌ Update Geocoding Error:", err);
            req.flash("error", "Unable to update map coordinates.");
        }
    }

    // STEP 3: If new image uploaded → update image
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    // STEP 4: Save final listing
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


// ----------------------------
// Delete Route
// ----------------------------
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) throw new ExpressError("Listing not found", 404);
    console.log(deletedListing);
    res.redirect("/listings");
};
