const mongoose = require('mongoose');

mongoose
  .connect(
    process.env.DATABASE,
    { useNewUrlParser: true }
  )
  .catch(err => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
  });
mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

require('../models/User');
require('../models/Store');
require('../models/Heart');
require('../models/Rate');
require('../models/Review');
require('../models/Reset');
