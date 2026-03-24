const mongoose = require('mongoose');
const Listing = require('../models/listing');
require('dotenv').config();

const mapToken = process.env.MAP_TOKEN;

// Geocoding function (same as in controller)
async function getCoordinates(location) {
  const fetch = (await import('node-fetch')).default;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${mapToken}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    return data.features[0].geometry;
  }
  throw new Error("No geocoding results found for: " + location);
}

async function updateListings() {
  try {
    const dbUrl = process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderlust";
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to database');

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings to process`);

    let updated = 0;
    let errors = 0;

    for (const listing of listings) {
      try {
        const location = listing.location;
        console.log(`Processing: "${listing.title}" (${location})`);

        const geoData = await getCoordinates(location);
        listing.geometry = geoData;
        await listing.save();
        updated++;
        console.log(`  ✅ Updated with coordinates:`, geoData.coordinates);
      } catch (err) {
        errors++;
        console.log(`  ❌ Error:`, err.message);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`  ✅ Updated: ${updated}`);
    console.log(`  ❌ Errors: ${errors}`);

    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

updateListings();
