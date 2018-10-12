const Review = require('../models/Review');
const Store = require('../models/Store');
const { isObjecIdValid } = require('./validateController');

exports.addReview = async (req, res) => {
  if (!isObjecIdValid(req.params.id)) {
    req.flash('error', 'You should not modify the form');
    return res.redirect('back');
  }
  const store = Store.findOne({ _id: req.params.id });
  if (!store) {
    req.flash('error', "Can't find store to add the comment");
    return res.redirect('back');
  }
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review Saved!');
  res.redirect('back');
};
