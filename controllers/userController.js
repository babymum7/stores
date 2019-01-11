const { unlinkSync, existsSync } = require('fs');
const crypto = require('crypto');
const User = require('../models/User');
const Reset = require('../models/Reset');
const send = require('../mail/resetPassword');
const { catchErrors } = require('../handlers/errorHandlers');

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

exports.updateAccount = catchErrors(async (req, res) => {
  const { name, email, avatar, password } = req.body;
  const oldPassword = req.body['old-password'];
  const uploads = { name, email };
  if (avatar) {
    uploads.avatar = avatar;
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: uploads },
    { new: true, runValidators: true, context: 'query' }
  );
  if (password) {
    await user.changePassword(oldPassword, password).catch(() => {
      req.flash('error', 'Your old password is incorrect');
      return res.redirect('back');
    });
    await user.save();
  }
  const pathFile = `${__dirname}/../public/images/uploads/avatars/${req.user.avatar}`;
  if (existsSync(pathFile) && avatar) {
    unlinkSync(pathFile);
  }
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
});

exports.forgotPassword = catchErrors(async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    req.flash('success', 'You have been emailed a password reset link.');
    return res.redirect('/login');
  }
  // Delete old token if any before create new onw
  await Reset.findOneAndDelete({ user: user._id });

  const reset = new Reset({
    token: crypto.randomBytes(20).toString('hex'),
    user: user._id
  });
  await reset.save();

  // prettier-ignore
  const resetURL = `https://${req.headers.host}/account/resetpassword/${reset.token}`;

  await send({
    email: user.email,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  });

  req.flash('success', 'You have been emailed a password reset link.');
  res.redirect('/login');
});

exports.resetPassword = catchErrors(async (req, res) => {
  const reset = await Reset.findOne({
    token: req.params.token,
    expires: { $gt: Date.now() }
  });
  if (!reset) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  res.render('reset', { title: 'Reset your Password' });
});

exports.updatePassword = catchErrors(async (req, res) => {
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

  // Delete token after set new password successfully
  await Reset.findOneAndDelete({ token: req.params.token });

  req.login(user, err => {
    if (err) {
      return err;
    }
    req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
    res.redirect('/');
  });
});
