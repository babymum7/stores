const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'You must supply an author!']
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    sparse: true,
    ref: 'Store',
    required: [true, 'You must supply a store!']
  },
  text: {
    type: String,
    required: [true, 'Your review must have test!'],
    trim: true
  }
});

ReviewSchema.statics.getReviews = function(storeId, skip = 0, limit = 10) {
  const id = mongoose.Types.ObjectId(storeId);
  return this.aggregate([
    { $match: { store: id } },
    { $sort: { created: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'rates',
        let: { storeId: '$store', authorId: '$author' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$user', '$$authorId'] }, { $eq: ['$store', '$$storeId'] }] } } }
        ],
        as: 'rating'
      }
    },
    { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
    { $addFields: { author: { $arrayElemAt: ['$author', 0] }, rating: { $arrayElemAt: ['$rating', 0] } } },
    { $project: { 'author.name': 1, 'author.avatar': 1, 'author.rating': '$rating.rating', text: 1, created: 1 } }
  ]);
};

module.exports = mongoose.model('Review', ReviewSchema);
