const mongoose = require('mongoose');

const HeartSchema = new mongoose.Schema({
  user: {
    index: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'You must supply an user']
  },
  store: {
    index: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'You must supply an store']
  },
  created: {
    type: Date,
    default: Date.now
  }
});

HeartSchema.index({ user: 1, store: 1 });

HeartSchema.statics.getScores = function(storeId) {
  const id = mongoose.Types.ObjectId(storeId);
  return this.aggregate([{ $match: { store: id } }, { $group: { _id: null, total: { $sum: { $literal: 1 } } } }]).then(
    results => results[0]
  );
};

HeartSchema.statics.getHeartedStores = async function(userid, page, limit = 6) {
  const skip = page * limit - limit;
  const heartedStoresPromise = this.find({ user: userid })
    .populate({ path: 'store', populate: { path: 'author reviews' } })
    .sort({ 'store.created': -1 })
    .skip(skip)
    .limit(limit);
  const countPromise = this.countDocuments({ user: userid });
  const [heartedStores, count] = await Promise.all([heartedStoresPromise, countPromise]);
  const pages = Math.ceil(count / limit) || 1;
  return {
    stores: heartedStores.map(heartedStore => heartedStore.store),
    hearts: heartedStores.map(heartedStore => heartedStore.store._id.toString()),
    pages,
    count
  };
};

module.exports = mongoose.model('Heart', HeartSchema);
