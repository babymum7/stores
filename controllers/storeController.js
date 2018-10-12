const { unlinkSync, existsSync } = require('fs');
const { join } = require('path');
const pug = require('pug');
const h = require('../helpers');
const Store = require('../models/Store');
const User = require('../models/User');
const Word = require('../models/Word');
const Review = require('../models/Review');
const { isObjecIdValid } = require('./validateController');

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();
  req.flash(
    'success',
    `Successfully Created ${store.name}. Care to leave a review?`
  );
  res.redirect('/');
};

exports.isUrlModified = async (req, res, next) => {
  if (!isObjecIdValid(req.params.id)) {
    req.flash('error', 'Something went wrong');
    return res.redirect('back');
  }
  const store = await Store.findOne({ _id: req.params.id });
  if (!store || store.author.toString() !== req.user._id.toString()) {
    req.flash('error', "You don't own this store");
    return res.redirect('back');
  }
  req.store = store;
  next();
};

exports.updateStore = async (req, res) => {
  const { store } = req;
  const pathFile = `${__dirname}/../public/images/uploads/${store.photo}`;
  if (existsSync(pathFile) && req.file) {
    unlinkSync(pathFile);
  }
  store.set(req.body);
  await Store.subtracttWords(req.params.id);
  await store.save();
  /* prettier-ignore */
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store</a>`);
  res.redirect(`/store/${store._id}/edit`);
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add store' });
};

exports.getStores = async (req, res) => {
  /* eslint-disable */
  /* prettier-ignore */
  const { stores, page, pages, count } = await Store.paging(req.params.page || 1);
  /* eslint-enable */
  if (!stores.length && page > pages) {
    req.flash(
      'info',
      `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`
    );
    res.redirect(`/stores/page/${pages}`);
    return;
  }
  res.render('stores', {
    title: 'Stores',
    stores,
    page,
    pages,
    count
  });
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({
    _id: req.params.id,
    author: req.user._id
  });
  if (store) {
    res.render('editStore', {
      title: `Edit ${store.name}`,
      store
    });
  } else {
    throw Error('You must own a store in order to edit it');
  }
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    'author',
    'name'
  );
  if (!store) return next();
  const scorePromise = Store.getScore(User, store._id);
  const reviewsPromise = Store.getReviews(Review, store._id);
  const [[score], reviews] = await Promise.all([scorePromise, reviewsPromise]);
  res.render('store', {
    store,
    title: store.name,
    score,
    reviews
  });
};

exports.getReviews = async (req, res) => {
  if (!isObjecIdValid(req.params.id)) {
    return res.status(400).json('Something went wrong');
  }
  const reviews = await Review.find({ store: req.params.id })
    .sort({ created: -1 })
    .skip(req.body.skip)
    .limit(10);
  if (reviews.length) {
    const html = reviews
      .map(e => {
        const htmlText = pug.renderFile(
          join(__dirname, '..', 'views', 'review', 'review.pug'),
          { review: e, h }
        );
        return htmlText;
      })
      .join('');
    return res.send(html);
  }
  res.json('');
};

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = { tags: tag || { $exists: true, $ne: [] } };
  const tagsPromise = Store.getTagsList();
  const pagingPromise = Store.paging(req.params.page || 1, tagQuery);

  const [tags, paging] = await Promise.all([tagsPromise, pagingPromise]);
  /* eslint-disable */
  const { stores, page, pages, count } = paging;
  /* eslint-enable */
  if (!stores.length && page > pages) {
    req.flash(
      'info',
      `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`
    );
    res.redirect(tag ? `/tag/${tag}/page/${pages}` : `/tags/page/${pages}`);
    return;
  }
  res.render('tag', {
    title: 'Tags',
    stores,
    tags,
    tag,
    page,
    pages,
    count
  });
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.mapStores = async (req, res) => {
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
  const stores = await Store.find(
    q,
    'slug name description location photo -_id'
  );
  res.json(stores);
};

exports.rateStore = async (req, res) => {
  if (!req.user) {
    return res.status(401).json('You must login to heart store');
  }
  if (!isObjecIdValid(req.params.id)) {
    return res.status(400).json('Something went wrong');
  }
  const store = await Store.findOne({ _id: req.params.id });
  if (!store) {
    return res
      .status(404)
      .json("We can't not found the store that you want to rate");
  }
  const stores = req.user.rates.map(obj => obj.store.toString());
  if (stores.includes(req.params.id.toString())) {
    await User.findOneAndUpdate(
      { _id: req.user._id, 'rates.store': req.params.id },
      {
        $set: { 'rates.$.rating': req.body.rating }
      },
      { new: true }
    );
    res.json(0);
  } else {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { rates: { store: req.params.id, rating: req.body.rating } }
      },
      { new: true }
    );
    res.json(1);
  }
};

exports.heartStore = async (req, res) => {
  if (!req.user) {
    return res.status(401).json('You must login to heart store');
  }
  if (!isObjecIdValid(req.params.id)) {
    return res.status(400).json('Something went wrong');
  }
  const store = await Store.findOne({ _id: req.params.id });
  if (!store) {
    return res
      .status(404)
      .json("We can't not found the store that you want to heart");
  }
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id.toString())
    ? '$pull'
    : '$addToSet';
  await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.id }
    },
    { new: true }
  );
  res.json('OK');
};

exports.getHearts = async (req, res) => {
  /* eslint-disable */
  const { stores, page, pages, count } = await Store.paging(
    req.params.page || 1,
    { _id: { $in: req.user.hearts } }
  );
  /* eslint-enable */
  res.render('stores', {
    title: 'Hearted Stores',
    stores,
    page,
    pages,
    count
  });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: '⭐ Top Stores!' });
};

exports.getCoorTopStore = async (req, res) => {
  const store = await Store.getCoorTopStore(User);
  if (store.length) {
    res.json(store[0].store[0].location.coordinates);
  } else {
    res.json([105.82014079999999, 21.0031177]);
  }
};

exports.searchStores = async (req, res) => {
  const { q } = req.query;
  const previousWords = q.slice(0, q.lastIndexOf(' ') + 1);
  const currentWord = q.slice(q.lastIndexOf(' ') + 1);
  const words = await Word.find({
    _id: { $regex: `^${currentWord}`, $options: 'i' }
  });
  const query = previousWords.concat(words.map(word => word._id).join(' '));
  const stores = await Store.find(
    { $text: { $search: query, $caseSensitive: false } },
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
};
