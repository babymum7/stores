const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.isObjecIdValid = input => input.match(/^[0-9a-fA-F]{24}$/);

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
  body(['email', 'name', 'password', 'password-confirm'])
    .exists()
    .not()
    .isEmpty()
    .withMessage('Fields can not be empty'),
  sanitizeBody('name')
    .trim()
    .escape(),
  body('name')
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

exports.review = [
  body('text')
    .exists()
    .not()
    .isEmpty()
    .withMessage("Text field can't not be empty")
    .trim(),
  catchErrors
];

exports.store = [
  body([
    'name',
    'location[address]',
    'location[coordinates][0]',
    'location[coordinates][1]'
  ])
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
