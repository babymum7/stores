const path = require('path');

const fileEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
require('dotenv').config({ path: path.join(__dirname, '..', `${fileEnv}.env`) });
const fs = require('fs');
const mongoose = require('mongoose');

mongoose
  .connect(
    process.env.DATABASE,
    { useNewUrlParser: true }
  )
  .catch(err => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
  });
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// import all of our models - they need to be imported only once
const Store = require('../models/Store');
const Review = require('../models/Review');
const User = require('../models/User');
const Heart = require('../models/Heart');
const Rate = require('../models/Rate');

const stores = JSON.parse(fs.readFileSync(`${__dirname}/stores.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const hearts = JSON.parse(fs.readFileSync(`${__dirname}/hearts.json`, 'utf-8'));
const rates = JSON.parse(fs.readFileSync(`${__dirname}/rates.json`, 'utf-8'));

async function deleteData() {
  console.log('😢😢 Goodbye Data...');
  await Store.deleteMany();
  await Review.deleteMany();
  await User.deleteMany();
  await Heart.deleteMany();
  await Rate.deleteMany();
  console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
  process.exit();
}

async function loadData() {
  try {
    await Store.insertMany(stores);
    await Review.insertMany(reviews);
    await User.insertMany(users);
    await Heart.insertMany(hearts);
    await Rate.insertMany(rates);
    console.log('👍👍👍👍👍👍👍👍 Done!');
    process.exit();
  } catch (e) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
    );
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes('--delete')) {
  deleteData();
} else {
  loadData();
}
