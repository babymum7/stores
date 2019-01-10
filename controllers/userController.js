const { unlinkSync, existsSync } = require('fs');
const { catchErrors } = require('../handlers/errorHandlers');
const User = require('../models/User');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.register = catchErrors(async (req, res, next) => {
  const { name, username, email, password, subscribe } = req.body;
  const user = new User({ email, name, username, subscribe });
  await User.register(user, password);
  next();
});

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
  const pathFile = `${__dirname}/../public/images/pictures/${req.user.picture}`;
  if (existsSync(pathFile)) {
    unlinkSync(pathFile);
  }
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
};
