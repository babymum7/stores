const mongoose = require('mongoose');

const RateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: [true, 'You must supply an user']
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    index: true,
    required: [true, 'You must supply an store']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  created: {
    type: Date,
    default: Date.now
  }
});

RateSchema.statics.getScores = function(storeId) {
  const id = mongoose.Types.ObjectId(storeId);
  return this.aggregate([
    { $match: { store: id } },
    { $group: { _id: null, total: { $sum: '$rating' }, average: { $avg: '$rating' } } }
  ]).then(results => results[0]);
};

RateSchema.statics.getCoorTopStore = function() {
  return this.aggregate([
    { $group: { _id: '$store', stars: { $sum: '$rating' } } },
    { $sort: { totalStar: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'stores',
        localField: '_id',
        foreignField: '_id',
        as: 'store'
      }
    },
    { $addFields: { store: { $arrayElemAt: ['$store', 0] } } },
    { $project: { 'store.location.coordinates': 1, _id: 0 } }
  ]).then(results => results[0]);
};

RateSchema.index({ user: 1, store: 1 });

module.exports = mongoose.model('Rate', RateSchema);
