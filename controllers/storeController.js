const { unlinkSync, existsSync } = require('fs');
const { catchErrors } = require('../handlers/errorHandlers');
const Rate = require('../models/Rate');
const Heart = require('../models/Heart');
const Store = require('../models/Store');
const Review = require('../models/Review');

const checkHeart = (user, stores) => {
  if (!user) return Promise.resolve(null);
  return Heart.find({ user: user._id, store: { $in: stores.map(store => store._id) } })
    .select('store')
    .then(rawHearts => rawHearts.map(rawHeart => rawHeart.store.toString()));
};

exports.getStoreCards = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const { stores, pages, count } = await Store.getStoreCards(page);

  const hearts = await checkHeart(req.user, stores);
  // ? if don't have any stores but have pages that mean it is skiped to much so the page dosen't exist
  if (!stores.length && page > pages) {
    req.flash('info', `Page ${page} doesn't exist, redirected to last page`);
    res.redirect(`/stores?page=${pages}`);
    return;
  }

  res.render('stores', { title: 'Stores', stores, page, pages, count, hearts });
});

exports.getStoresCardsByTag = catchErrors(async (req, res) => {
  const { tag } = req.params;
  const page = parseInt(req.query.page, 10) || 1;

  const tagsPromise = Store.getTagsList();
  const storeCardsPromise = Store.getStoreCards(page, { tags: tag || { $exists: true, $ne: [] } });

  const [tags, { stores, pages, count }] = await Promise.all([tagsPromise, storeCardsPromise]);

  const hearts = await checkHeart(req.user, stores);
  // ? if don't have any stores but have pages that mean it is skiped to much so the page dosen't exist
  if (!stores.length && page > pages) {
    req.flash('info', `Page ${page} doesn't exist, redirected to last page`);
    res.redirect(tag ? `/tag/${tag}?page=${pages}` : `/tags?page=${pages}`);
    return;
  }

  res.render('tag', { title: 'Tags', stores, tags, tag, page, pages, count, hearts });
});

exports.getStoresByHeart = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;

  const { stores, hearts, pages, count } = await Heart.getHeartedStores(req.user.id, page);

  res.render('stores', { title: 'Hearted Stores', stores, page, pages, count, hearts });
});

exports.getStore = catchErrors(async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author', 'name');
  if (!store) return next();
  const id = store._id;
  const allPromise = [];
  allPromise.push(Heart.getScores(id), Rate.getScores(id), Review.getReviews(id));
  if (req.user) {
    allPromise.push(
      Rate.findOne({ user: req.user._id, store: id }).select('rating'),
      Heart.findOne({ user: req.user._id, store: id }).select('_id')
    );
  }
  const [hearts, scores, reviews, userRating, hearted] = await Promise.all(allPromise);
  const rating = userRating ? userRating.rating : null;
  res.render('store', { title: store.name, store, hearts, hearted, scores, reviews, rating });
});

exports.addStoreForm = (req, res) => {
  res.render('editStore', { title: 'Add store' });
};

exports.createStore = catchErrors(async (req, res) => {
  req.body.author = req.user._id;
  const store = new Store(req.body);
  await store.save();
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect('/');
});

exports.editStoreForm = (req, res) => {
  const { store } = req;
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = catchErrors(async (req, res) => {
  const { store } = req;
  const pathFile = `${__dirname}/../public/images/uploads/stores/${store.photo}`;
  if (existsSync(pathFile) && req.file) {
    unlinkSync(pathFile);
  }
  store.set(req.body);
  await store.save();
  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store</a>`
  );
  res.redirect(`/store/edit/${store._id}`);
});

exports.getTopStores = catchErrors(async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: '⭐ Top Stores!' });
});
