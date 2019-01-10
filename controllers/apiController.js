const { join } = require('path');
const pug = require('pug');
const h = require('../lib/helpers');
const Review = require('../models/Review');
const isObjecIdValid = require('../lib/isObjecIdValid');
const { catchErrors } = require('../handlers/errorHandlers');
const User = require('../models/User');
const Store = require('../models/Store');
const Rate = require('../models/Rate');
const Heart = require('../models/Heart');

exports.rateStore = catchErrors(async (req, res) => {
  if (!req.user) {
    return res.status(401).json('You must login to heart store');
  }
  if (!isObjecIdValid(req.params.id)) {
    return res.status(400).json('Something went wrong');
  }
  const [rate, store] = await Promise.all([
    Rate.findOne({ user: req.user._id, store: req.params.id }),
    Store.findOne({ _id: req.params.id })
  ]);
  if (!store) {
    return res.status(404).json("We can't not found the store that you want to rate");
  }
  if (!rate) {
    const newRate = new Rate({ user: req.user._id, store: req.params.id, rating: req.body.rating });
    await newRate.save();
    return res.json(1);
  }
  rate.set({ rating: req.body.rating });
  await rate.save();
  res.json(0);
});

exports.getReviews = catchErrors(async (req, res) => {
  if (!isObjecIdValid(req.params.id)) {
    return res.status(400).json('Something went wrong');
  }
  const reviews = await Review.getReviews(req.params.id, req.body.skip);
  if (reviews.length) {
    const html = reviews
      .map(e => {
        const htmlText = pug.renderFile(join(__dirname, '..', 'views', 'review', 'review.pug'), { review: e, h });
        return htmlText;
      })
      .join('');
    return res.send(html);
  }
  res.json('');
});

exports.heartStore = catchErrors(async (req, res) => {
  if (!req.user) {
    return res.status(401).json('You must login to heart store');
  }
  if (!isObjecIdValid(req.params.id)) {
    return res.status(400).json('Something went wrong');
  }
  const [heart, store] = await Promise.all([
    Heart.findOne({ user: req.user._id, store: req.params.id }),
    Store.findOne({ _id: req.params.id })
  ]);
  if (!store) {
    return res.status(404).json("We can't not found the store that you want to heart");
  }
  if (!heart) {
    const newheart = new Heart({ user: req.user._id, store: req.params.id });
    await newheart.save();
    return res.json(1);
  }
  await Heart.findOneAndDelete({ user: req.user._id, store: req.params.id });
  res.json(0);
});

exports.getCoorTopStore = catchErrors(async (req, res) => {
  const rate = await Rate.getCoorTopStore(User);
  if (rate) {
    res.json(rate.store.location.coordinates);
  } else {
    res.json([105.82014079999999, 21.0031177]);
  }
});

exports.mapStores = catchErrors(async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000
      }
    }
  };
  const stores = await Store.find(q, 'slug name description location photo -_id');
  res.json(stores);
});

exports.searchStores = catchErrors(async (req, res) => {
  const { query } = req;
  const stores = await Store.find(
    { $text: { $search: query.q, $caseSensitive: false } },
    {
      score: { $meta: 'textScore' },
      name: 1,
      slug: 1,
      _id: 0
    }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(7);
  res.json(stores);
});
