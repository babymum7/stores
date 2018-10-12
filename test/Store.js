const mongoose = require('mongoose');

const { Schema } = mongoose;

const storeSchema = new Schema({
  name: String,
  description: String
});

module.exports = mongoose.model('store', storeSchema);
