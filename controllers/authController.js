const passport = require('passport');
const isObjecIdValid = require('../lib/isObjecIdValid');
const Store = require('../models/Store');
const { catchErrors } = require('../handlers/errorHandlers');

exports.isNotLoggedIn = (req, res, next) => {
  if (req.isUnauthenticated()) {
    return next();
  }
  req.flash('error', 'Oops you must be logged out to do that!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.isOwnStore = catchErrors(async (req, res, next) => {
  if (!isObjecIdValid(req.params.id)) {
    req.flash('error', "You don't own this store");
    return res.redirect('back');
  }
  const store = await Store.findOne({ _id: req.params.id, author: req.user._id });
  if (!store) {
    req.flash('error', "You don't own this store");
    return res.redirect('back');
  }
  req.store = store;
  next();
});

exports.login = [
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Invalid email or password',
    successFlash: 'Welcome!'
  }),
  // Handle remember me
  (req, res) => {
    if (req.body.remember) {
      req.session.remember = req.user.username;
    } else if (req.session.remember) {
      delete req.session.remember;
    }
    res.redirect('/');
  }
];

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/login');
};

exports.authGoogle = passport.authenticate('google', {
  scope: ['profile', 'email']
});
exports.authGoogleCb = passport.authenticate('google', {
  failureRedirect: '/login',
  failureFlash: 'You need to login into given url',
  successRedirect: '/',
  successFlash: 'Welcome!'
});

exports.authFacebook = passport.authenticate('facebook', {
  authType: 'rerequest',
  scope: ['user_link', 'email']
});
exports.authFacebookCb = passport.authenticate('facebook', {
  failureRedirect: '/login',
  failureFlash: 'You need to login into given url',
  successRedirect: '/',
  successFlash: 'Welcome!'
});

// exports.authTwitter = passport.authenticate('twitter');
// exports.authTwitterCb = passport.authenticate('twitter', {
//   failureRedirect: '/login',
//   failureFlash: 'You need to login into given url',
//   successRedirect: '/',
//   successFlash: 'Welcome!'
// });
