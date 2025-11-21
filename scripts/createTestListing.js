const mongoose = require('mongoose');
require('dotenv').config();
const Listing = require('../models/listing');

const dbUrl = process.env.ATLAS_DB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

async function run() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to DB');

    const test = new Listing({
      title: 'Test Listing from script',
      description: 'Created by test script',
      price: 123,
      location: 'Test City',
      country: 'Testland',
      categories: ['Mountains'],
      image: { url: '', filename: '' },
      geometry: { type: 'Point', coordinates: [75.8, 26.9] }
    });

    const saved = await test.save();
    console.log('Saved listing id:', saved._id.toString());
    await mongoose.disconnect();
    console.log('Disconnected');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
