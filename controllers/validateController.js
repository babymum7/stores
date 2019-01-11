const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const validator = require('validator');

const catchErrors = (req, res, next) => {
  const errorFormatter = ({ msg }) => msg;
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    req.flash('error', result.array());
    return res.redirect('back');
  }
  next();
};

exports.register = [
  body(['email', 'name', 'username', 'password', 'password-confirm'])
    .exists()
    .not()
    .isEmpty()
    .withMessage('Fields can not be empty'),
  sanitizeBody(['name', 'username'])
    .trim()
    .escape(),
  body(['name', 'username'])
    .isLength({ max: 50 })
    .withMessage('Name field can not be more than 50 characters'),
  body('email')
    .isEmail()
    .withMessage('You must supply a vaild email')
    .isLength({ max: 100 })
    .withMessage('Email field can not be more than 100 characters'),
  sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('The password must be at least 6 characters long'),
  body('password-confirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Oops! Your passwords do not match'),
  catchErrors
];

exports.account = (req, res, next) => {
  let { email, name } = req.body;
  const { avatar, password } = req.body;
  const passwordConfirm = req.body['password-confirm'];
  const oldPassword = req.body['old-password'];
  email = email && email.trim();
  name = name && name.trim();

  if (!email || !name) {
    req.flash('error', 'Email or Name filed can not be empty');
    return res.redirect('back');
  }

  if (email !== req.user.email) {
    if (!validator.isEmail(email)) {
      req.flash('error', 'You must supply a vaild email');
      return res.redirect('back');
    }
    if (!validator.isLength(email, { max: 100 })) {
      req.flash('error', 'Email field can not be more than 100 characters');
      return res.redirect('back');
    }
    email = validator.normalizeEmail(email, {
      gmail_remove_dots: false,
      remove_extension: false,
      gmail_remove_subaddress: false
    });
  }

  if (name !== req.user.name) {
    if (!validator.isLength(name, { max: 50 })) {
      req.flash('error', 'Name field can not be more than 50 characters');
      return res.redirect('back');
    }
    name = validator.escape(name);
  }

  if (password) {
    if (!oldPassword) {
      req.flash('error', 'You must supply old password to change pasword');
      return res.redirect('back');
    }

    if (!validator.isLength(password, { min: 6 })) {
      req.flash('error', 'The password must be at least 6 characters long');
      return res.redirect('back');
    }
    if (!(passwordConfirm === password)) {
      req.flash('error', 'Oops! Your passwords do not match');
      return res.redirect('back');
    }
  }

  if (!avatar && email === req.user.email && name === req.user.name && !password) {
    req.flash('info', "Your infomation didn't change");
    return res.redirect('back');
  }

  next();
};

exports.login = [
  body(['username', 'password'])
    .exists()
    .not()
    .isEmpty()
    .withMessage('Fields can not be empty'),
  sanitizeBody('username')
    .trim()
    .escape(),
  body('username')
    .isLength({ max: 50 })
    .withMessage('Name field can not be more than 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('The password must be at least 6 characters long'),
  catchErrors
];

exports.review = [
  body('text')
    .exists()
    .not()
    .isEmpty()
    .withMessage("Text field can't not be empty")
    .trim(),
  catchErrors
];

exports.storeFormFields = [
  body(['name', 'location[address]', 'location[coordinates][0]', 'location[coordinates][1]'])
    .exists()
    .not()
    .isEmpty()
    .withMessage("Name and address, lng, lat can't not be empty")
    .trim(),
  body('name')
    .isLength({ max: 100 })
    .withMessage('Name field can not be more than 100 characters'),
  body('description').trim(),
  catchErrors
];

exports.confirmedPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('The password must be at least 6 characters long'),
  body('password-confirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Oops! Your passwords do not match'),
  catchErrors
];
