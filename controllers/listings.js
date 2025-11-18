const Listing = require("../models/listing");
const cloudinary = require("../cloudConfig");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const mapToken = process.env.MAP_TOKEN;

// MAPTILER FORWARD GEOCODING
async function getCoordinates(location) {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${mapToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
        return data.features[0].geometry;
    } 
    throw new Error("No geocoding results found");
}



// INDEX
module.exports.index = async (req, res) => {
    const { q } = req.query;

    // escape special regex chars to avoid ReDoS or unintended patterns
    const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let allListings;
    if (q && q.trim().length > 0) {
        const safe = escapeRegex(q.trim());
        const regex = new RegExp(safe, "i");
        // search by title, location or country
        allListings = await Listing.find({ $or: [{ title: regex }, { location: regex }, { country: regex }] });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings, q });
};


// NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// SHOW ROUTE
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


// CREATE ROUTE (FINAL FIXED VERSION)
module.exports.createListing = async (req, res) => {
    try {
        const location = req.body.listing.location;
        const geoData = await getCoordinates(location);

        let imageURL = null;
        let publicID = null;

        // CLOUDINARY UPLOAD
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: "wanderlust_DEV"
            });

            imageURL = uploadResponse.secure_url;
            publicID = uploadResponse.public_id;
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // image
        newListing.image = {
            url: imageURL,
            filename: publicID
        };

        // map geometry
        newListing.geometry = geoData;

        await newListing.save();

        req.flash("success", "New Listing Created Successfully!");
        res.redirect(`/listings/${newListing._id}`);

    } catch (err) {
        console.error("❌ Create Error:", err);
        req.flash("error", "Error creating listing");
        res.redirect("/listings/new");
    }
};


// EDIT
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url?.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};


// UPDATE (FINAL FIXED VERSION)
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Map update
    if (req.body.listing.location) {
        try {
            const newGeoData = await getCoordinates(req.body.listing.location);
            listing.geometry = newGeoData;
        } catch (err) {
            console.error("❌ Geocoding Error:", err);
        }
    }

    // Image update
    if (req.file) {
        const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
            folder: "wanderlust_DEV"
        });

        listing.image = {
            url: uploadResponse.secure_url,
            filename: uploadResponse.public_id
        };
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


// DELETE
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};
