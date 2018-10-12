const mongoose = require('mongoose');
const slug = require('slugs');
const { mapAdd, mapMinus, reduce } = require('../handlers/mapReduce');

const { Schema } = mongoose;

const storeSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please enter a store name!'],
      maxlength: 100
    },
    slug: {
      type: String,
      unique: true,
      index: true
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'You must supply an author']
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

storeSchema.index({
  name: 'text',
  tags: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere' });

async function changeSameSlug() {
  if (this.isModified('name')) {
    this.slug = slug(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    if (storesWithSlug.length) {
      const numbers = storesWithSlug.map(storeWithSlug => {
        const result = storeWithSlug.slug.match(/\d+$/);
        return result ? result[0] : 0;
      });
      const max = Math.max(...numbers);
      this.slug = `${this.slug}-${max + 1}`;
    }
  }
}

storeSchema.pre('save', changeSameSlug);

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: { $literal: 1 } } } },
    { $sort: { count: -1 } }
  ]);
};

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
});

const populateReviews = {
  path: 'reviews',
  select: 'created -_id'
};

storeSchema.statics.paging = async function(page, query = {}, limit = 6) {
  const skip = page * limit - limit;
  const storesPromise = this.find(query)
    .populate('author', 'name')
    .populate(populateReviews)
    .sort({ created: -1 })
    .skip(skip)
    .limit(limit);
  const countPromise = this.countDocuments(query);
  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit) || 1;
  return {
    stores,
    page,
    pages,
    count
  };
};

storeSchema.statics.getReviews = function(Review, storeId) {
  const id = mongoose.Types.ObjectId(storeId);
  return Review.find({ store: id })
    .sort({ created: -1 })
    .limit(10);
};

storeSchema.statics.getScore = function(User, storeId) {
  const id = mongoose.Types.ObjectId(storeId);
  return User.aggregate([
    { $unwind: '$rates' },
    {
      $match: { 'rates.store': id }
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $literal: 1 } },
        average: { $avg: '$rates.rating' }
      }
    }
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'users',
        let: { storeId: '$_id' },
        pipeline: [
          { $unwind: '$rates' },
          { $match: { $expr: { $eq: ['$rates.store', '$$storeId'] } } },
          { $project: { 'rates.rating': 1, _id: 0 } }
        ],
        as: 'rates'
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews'
      }
    },
    {
      $match: {
        $and: [{ 'reviews.1': { $exists: true } }, { rates: { $ne: [] } }]
      }
    },
    {
      $project: {
        photo: 1,
        name: 1,
        slug: 1,
        reviews: { $size: '$reviews' },
        totalStars: { $sum: '$rates.rates.rating' },
        averageRating: { $avg: '$rates.rates.rating' },
        _id: 0
      }
    },
    { $sort: { totalStars: -1 } },
    { $limit: 10 }
  ]);
};

storeSchema.statics.getCoorTopStore = function(User) {
  return User.aggregate([
    { $unwind: '$rates' },
    { $group: { _id: '$rates.store', totalStar: { $sum: '$rates.rating' } } },
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
    { $project: { 'store.location.coordinates': 1, _id: 0 } }
  ]);
};

async function extractWords() {
  try {
    await this.constructor.mapReduce({
      map: mapAdd,
      reduce,
      out: { reduce: 'words' },
      query: { _id: this._id }
    });
  } catch (err) {
    console.log(err.message);
  }
}

storeSchema.post('save', extractWords);

storeSchema.statics.subtracttWords = function(id) {
  const objectId = mongoose.Types.ObjectId(id);
  return this.mapReduce({
    map: mapMinus,
    reduce,
    out: { reduce: 'words' },
    query: { _id: objectId }
  });
};

const Store = mongoose.model('Store', storeSchema);

// prettier-ignore
Store.mapReduce({ map: mapAdd, reduce, out: { replace: 'words' } }).catch(err => console.log(err.message));

module.exports = Store;
