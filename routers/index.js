const router = require('express').Router();
const jimp = require('jimp');
const { handleErrors } = require('../handlers/errorHandlers');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const formFileController = require('../controllers/formFileController');
const validateController = require('../controllers/validateController');

router.get('/', handleErrors(storeController.getStores));

router.get('/stores', handleErrors(storeController.getStores));
router.get('/stores/page/:page', handleErrors(storeController.getStores));

router.get('/store/:slug', handleErrors(storeController.getStoreBySlug));

router.get('/tags', handleErrors(storeController.getStoresByTag));
router.get('/tags/page/:page', handleErrors(storeController.getStoresByTag));

router.get('/tag/:tag', handleErrors(storeController.getStoresByTag));
router.get(
  '/tag/:tag/page/:page',
  handleErrors(storeController.getStoresByTag)
);

router.get('/add', authController.isLoggedIn, storeController.addStore);
router.post(
  '/add',
  authController.isLoggedIn,
  formFileController.upload('photo'),
  validateController.store,
  handleErrors(formFileController.resize('photo', 800, jimp.AUTO, 'uploads')),
  handleErrors(storeController.createStore)
);

router.get(
  '/store/:id/edit',
  authController.isLoggedIn,
  handleErrors(storeController.editStore)
);
router.post(
  '/store/:id/edit',
  authController.isLoggedIn,
  handleErrors(storeController.isUrlModified),
  formFileController.upload('photo'),
  validateController.store,
  handleErrors(formFileController.resize('photo', 800, jimp.AUTO, 'uploads')),
  handleErrors(storeController.updateStore)
);

router.get('/map', storeController.mapPage);

router.post(
  '/reviews/:id',
  authController.isLoggedIn,
  validateController.review,
  handleErrors(reviewController.addReview)
);

router.post('/store/:id/rate', handleErrors(storeController.rateStore));

router.get(
  '/hearts',
  authController.isLoggedIn,
  handleErrors(storeController.getHearts)
);

router.get(
  '/register',
  authController.isNotLoggedIn,
  userController.registerForm
);
router.post(
  '/register',
  validateController.register,
  handleErrors(userController.register),
  authController.login
);

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get(
  '/auth/google',
  authController.isNotLoggedIn,
  authController.authGoogle
);
router.get(
  '/auth/google/callback',
  authController.isNotLoggedIn,
  authController.authGoogleCb
);

router.get(
  '/auth/facebook',
  authController.isNotLoggedIn,
  authController.authFacebook
);
router.get(
  '/auth/facebook/callback',
  authController.isNotLoggedIn,
  authController.authFacebookCb
);

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post(
  '/account',
  authController.isLoggedIn,
  formFileController.upload('picture'),
  handleErrors(formFileController.resize('picture', 200, 200, 'pictures')),
  userController.updateAccount
);
router.post('/account/forgot', handleErrors(authController.forgot));
router.get('/account/reset/:token', handleErrors(authController.reset));
router.post(
  '/account/reset/:token',
  validateController.confirmedPassword,
  handleErrors(authController.update)
);

router.get('/top', handleErrors(storeController.getTopStores));

/* API */

router.get('/api/search', handleErrors(storeController.searchStores));
router.get('/api/stores/near', handleErrors(storeController.mapStores));
router.get('/api/coortopstore', handleErrors(storeController.getCoorTopStore));
router.post('/store/:id/heart', handleErrors(storeController.heartStore));
router.post('/store/:id/loadreview', handleErrors(storeController.getReviews));

module.exports = router;
