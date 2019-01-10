const mongoose = require('mongoose');
const slug = require('slugs');
const uuidv1 = require('uuid/v1');

const StoreSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Please enter a store name!'],
      maxlength: 100
    },
    description: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      index: true
    },
    created: {
      type: Date,
      index: true,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'You must supply coordinates!']
      },
      address: {
        type: String,
        required: [true, 'You must supply an address!']
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'You must supply an author']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

StoreSchema.virtual('totalReview', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store',
  count: true
});

StoreSchema.index({
  name: 'text',
  tags: 'text',
  description: 'text'
});

StoreSchema.index({ location: '2dsphere' });

StoreSchema.pre('save', function() {
  if (!this.isModified('name')) {
    return null;
  }
  this.slug = `${slug(this.name)}-${uuidv1()}`;
});

StoreSchema.statics.getStoreCards = async function(page, query = {}, limit = 6) {
  const skip = page * limit - limit;
  const storesPromise = this.find(query)
    .populate('author', 'name')
    .populate('totalReview')
    .sort({ created: -1 })
    .skip(skip)
    .limit(limit);
  const countPromise = this.countDocuments(query);
  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit) || 1;
  return { stores, count, pages };
};

StoreSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: { $literal: 1 } } } },
    { $sort: { count: -1 } }
  ]);
};

StoreSchema.statics.getTopStores = function() {
  return this.aggregate([
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews' } },
    { $lookup: { from: 'hearts', localField: '_id', foreignField: 'store', as: 'hearts' } },
    { $lookup: { from: 'rates', localField: '_id', foreignField: 'store', as: 'rates' } },
    { $match: { $and: [{ 'reviews.1': { $exists: true } }, { rates: { $ne: [] } }] } },
    {
      $addFields: {
        reviews: { $size: '$reviews' },
        hearts: { $size: '$hearts' },
        rates: { $sum: '$rates.rating' },
        avgRates: { $avg: '$rates.rating' }
      }
    },
    { $sort: { rates: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('Store', StoreSchema);
