const { unlinkSync, existsSync } = require('fs');
const { join } = require('path');
const User = require('../models/User');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.register = async (req, res, next) => {
  /* eslint-disable */
  const { name, email, password, subscribe } = req.body;
  /* eslint-enable */
  const user = new User({ email, name, subscribe });
  await User.register(user, password);
  next();
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const { name, email, picture } = req.body;
  const update = { name, email, picture };
  await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: update },
    { new: true, runValidators: true, context: 'query' }
  );
  const pathFile = join(__dirname, '..', 'public', 'images');
  if (existsSync(join(pathFile, 'pictures', req.user.picture))) {
    unlinkSync(join(pathFile, 'pictures', req.user.picture));
  }
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
};