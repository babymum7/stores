const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'You must supply an author!']
  },
  store: {
    type: Schema.Types.ObjectId,
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

reviewSchema.pre('find', function() {
  this.populate('author', 'name email avatar rates picture -_id');
});

reviewSchema.virtual('rating').get(function() {
  const document = this;
  if (document.author.rates.length) {
    const rate = document.author.rates.find(
      e => e.store.toString() === document.store.toString()
    );
    if (rate) return rate.rating;
  }
});

module.exports = mongoose.model('Review', reviewSchema);
