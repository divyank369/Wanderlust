const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/user');

const dbUrl = process.env.ATLAS_DB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

async function run() {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to DB');

    const user = new User({ email: 'testuser@example.com', username: 'testuser' });
    const registered = await User.register(user, 'secretpass');
    console.log('Registered user:', registered.username);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
