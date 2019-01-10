const router = require('express').Router();
const { catchErrors } = require('../handlers/errorHandlers');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');
const validateController = require('../controllers/validateController');
const mapController = require('../controllers/mapController');
const apiController = require('../controllers/apiController');

// Home pages, stores
router.get('/', storeController.getStoreCards);
router.get('/stores', storeController.getStoreCards);
router.get('/stores?page=:page', storeController.getStoreCards);
/* ------- */

// Get Stores By Tags
router.get('/tags', storeController.getStoresCardsByTag);
router.get('/tags?page=:page', storeController.getStoresCardsByTag);
router.get('/tag/:tag', storeController.getStoresCardsByTag);
router.get('/tag/:tag?page=:page', storeController.getStoresCardsByTag);
/* ------- */

// Get Stores By Heart
router.get('/hearts', authController.isLoggedIn, storeController.getStoresByHeart);
router.get('/hearts?page=:page', authController.isLoggedIn, storeController.getStoresByHeart);
/* ------- */

// Get specific store
router.get('/store/:slug', storeController.getStore);
/* ------- */

// Register Login Logout
router.get('/register', authController.isNotLoggedIn, userController.registerForm);
router.post('/register', validateController.register, userController.register, authController.login);

router.get('/login', authController.isNotLoggedIn, userController.loginForm);
router.post('/login', validateController.login, authController.login);

router.get('/auth/google', authController.isNotLoggedIn, authController.authGoogle);
router.get('/auth/google/callback', authController.isNotLoggedIn, authController.authGoogleCb);

router.get('/auth/facebook', authController.isNotLoggedIn, authController.authFacebook);
router.get('/auth/facebook/callback', authController.isNotLoggedIn, authController.authFacebookCb);

router.get('/logout', authController.isLoggedIn, authController.logout);
/* ------- */

// Create and edit store
router.get('/add', authController.isLoggedIn, storeController.addStoreForm);
router.post(
  '/add',
  authController.isLoggedIn,
  fileController.uploadStoreImage,
  validateController.storeFormFields,
  fileController.resizeStoreImage,
  storeController.createStore
);

router.get('/store/edit/:id', authController.isLoggedIn, authController.isOwnStore, storeController.editStoreForm);
router.post(
  '/store/edit/:id',
  authController.isLoggedIn,
  authController.isOwnStore,
  fileController.uploadStoreImage,
  validateController.storeFormFields,
  fileController.resizeStoreImage,
  storeController.updateStore
);
/* ------- */

// Add new review to store
router.post('/reviews/:id', authController.isLoggedIn, validateController.review, reviewController.addReview);
/* ------- */

// Map Page
router.get('/map', mapController.map);
/* ------- */

// Top stores
router.get('/top', storeController.getTopStores);
/* ------- */

// Account
router.get('/account', authController.isLoggedIn, userController.account);
// router.post(
//   '/account',
//   authController.isLoggedIn,
//   formFileController.upload('picture'),
//   catchErrors(formFileController.resize('picture', 200, 200, 'pictures')),
//   userController.updateAccount
// );
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', validateController.confirmedPassword, catchErrors(authController.update));
/* ------- */

/* API */
// Search
router.get('/api/search', apiController.searchStores);
// Get stores near specific location
router.get('/api/stores/near', apiController.mapStores);
// Get coordinate of top 1 store
router.get('/api/coortopstore', apiController.getCoorTopStore);
// Rate a store
router.post('/store/rate/:id', apiController.rateStore);
// Heart a store
router.post('/store/heart/:id', apiController.heartStore);
// Get more reviews of a store
router.post('/store/loadreview/:id', apiController.getReviews);
/* ------- */

module.exports = router;
