const mongoose = require('mongoose');
require('dotenv').config();
const Listing = require('../models/listing');
const User = require('../models/user');
const cloudinary = require('../cloudConfig');

const dbUrl = process.env.ATLAS_DB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

async function run() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to DB');

    // find test user
    const user = await User.findOne({ username: 'testuser' });
    const ownerId = user ? user._id : null;

    // upload image to cloudinary
    console.log('Uploading image to Cloudinary...');
    // helper with one retry on timeout
    const uploadWithRetry = async (path, retries = 1) => {
      try {
        return await cloudinary.uploader.upload(path, { folder: 'wanderlust_DEV' });
      } catch (err) {
        const isTimeout = err && err.error && (err.error.http_code === 499 || err.error.name === 'TimeoutError' || err.name === 'TimeoutError');
        if (isTimeout && retries > 0) {
          console.warn('Cloudinary upload timed out, retrying once...');
          return uploadWithRetry(path, retries - 1);
        }
        throw err;
      }
    };

    const uploadResp = await uploadWithRetry('scripts/test.png', 1);
    console.log('Upload response:', uploadResp.public_id);

    const listing = new Listing({
      title: 'Script Upload Listing',
      description: 'Created via script with Cloudinary upload',
      price: 55,
      location: 'Script City',
      country: 'ScriptLand',
      categories: ['Mountains'],
      image: { url: uploadResp.secure_url, filename: uploadResp.public_id },
      geometry: { type: 'Point', coordinates: [75.8, 26.9] },
      owner: ownerId
    });

    const saved = await listing.save();
    console.log('Saved listing id:', saved._id.toString());
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
