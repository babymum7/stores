const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const Reset = require('../models/Reset');
const send = require('../handlers/mailToResetPassword');
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

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Invalid email or password',
  successRedirect: '/',
  successFlash: 'Welcome!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
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

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('success', 'You have been emailed a password reset link.');
    return res.redirect('/login');
  }
  const reset = new Reset({
    token: crypto.randomBytes(20).toString('hex'),
    user: user._id
  });
  await reset.save();

  // prettier-ignore
  const resetURL = `https://${req.headers.host}/account/reset/${reset.token}`;

  await send({
    email: user.email,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  });

  req.flash('success', 'You have been emailed a password reset link.');
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const reset = await Reset.findOne({ token: req.params.token });
  if (!reset) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  res.render('reset', { title: 'Reset your Password' });
};

exports.update = async (req, res) => {
  const reset = await Reset.findOne({
    token: req.params.token,
    expires: { $gt: Date.now() }
  });
  if (!reset) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  const user = await User.findOne({ _id: reset.user });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  await user.setPassword(req.body.password);
  await user.save();
  req.login(user, err => {
    if (err) {
      return err;
    }
    req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
    res.redirect('/');
  });
};
