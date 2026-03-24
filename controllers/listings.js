const Listing = require("../models/listing");
const cloudinary = require("../cloudConfig");
const fs = require('fs').promises;
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
    const { q, filter } = req.query;

    // escape special regex chars to avoid ReDoS or unintended patterns
    const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let allListings;

    // If a filter is present, try to interpret it
    if (filter && filter.trim().length > 0) {
        const f = filter.trim();
        // map UI filter names to category values in the model
        const categoryMap = {
            'Iconic Cities': 'Cities',
            'Mountains': 'Mountains',
            'Amazing Pools': 'Amazing Pools',
            'Castles': 'Castles',
            'Camping': 'Camping',
            'Farms': 'Farms',
            'Arctic': 'Arctic'
        };

        if (f === 'Trending') {
            // Return listings sorted by average rating (descending). Use aggregation to compute avg rating.
            allListings = await Listing.aggregate([
                { $lookup: { from: 'reviews', localField: 'reviews', foreignField: '_id', as: 'reviews_docs' } },
                { $addFields: { avgRating: { $avg: '$reviews_docs.rating' } } },
                { $sort: { avgRating: -1 } }
            ]);
            // aggregate returns plain objects; optionally populate owner if needed. Keep as-is.
        } else if (categoryMap[f]) {
            allListings = await Listing.find({ categories: categoryMap[f] });
        } else if (q && q.trim().length > 0) {
            const safe = escapeRegex(q.trim());
            const regex = new RegExp(safe, "i");
            allListings = await Listing.find({ $or: [{ title: regex }, { location: regex }, { country: regex }] });
        } else {
            // unknown filter - fallback to all
            allListings = await Listing.find({});
        }
    } else {
        if (q && q.trim().length > 0) {
            const safe = escapeRegex(q.trim());
            const regex = new RegExp(safe, "i");
            // search by title, location or country
            allListings = await Listing.find({ $or: [{ title: regex }, { location: regex }, { country: regex }] });
        } else {
            allListings = await Listing.find({});
        }
    }

    res.render("listings/index.ejs", { allListings, q, filter });
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
            // helper to upload with one retry on timeout
            const uploadWithRetry = async (path, retries = 1) => {
                try {
                    const resp = await cloudinary.uploader.upload(path, { folder: 'wanderlust_DEV' });
                    return resp;
                } catch (err) {
                    // Cloudinary uses 499 for client timeout; also check name
                    const isTimeout = (err && (err.http_code === 499 || err.name === 'TimeoutError'));
                    if (isTimeout && retries > 0) {
                        console.warn('Cloudinary upload timed out, retrying once...');
                        return uploadWithRetry(path, retries - 1);
                    }
                    throw err;
                }
            };

            try {
                const uploadResponse = await uploadWithRetry(req.file.path, 1);
                imageURL = uploadResponse.secure_url;
                publicID = uploadResponse.public_id;
            } catch (uploadErr) {
                // ensure temp file is removed, then fail with user-friendly message
                try { await fs.unlink(req.file.path); } catch (e) { /* ignore */ }
                console.error('❌ Cloudinary upload failed:', uploadErr);
                req.flash('error', 'Image upload failed (timeout or network error). Try again with a smaller image or later.');
                return res.redirect('/listings/new');
            }

            // cleanup temp file after success
            try { await fs.unlink(req.file.path); } catch (e) { /* ignore */ }
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
