const mongoose = require('mongoose');

const { Schema } = mongoose;

const wordSchema = new Schema({
  _id: String,
  score: Number
});

module.exports = mongoose.model('Word', wordSchema);
