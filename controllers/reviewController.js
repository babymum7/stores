const Review = require('../models/Review');
const Store = require('../models/Store');
const isObjecIdValid = require('../lib/isObjecIdValid');
const { catchErrors } = require('../handlers/errorHandlers');

exports.addReview = catchErrors(async (req, res) => {
  if (!isObjecIdValid(req.params.id)) {
    req.flash('error', 'Something went wrong');
    return res.redirect('back');
  }
  const store = await Store.findOne({ _id: req.params.id });
  if (!store) {
    req.flash('error', "Can't find store to add the comment");
    return res.redirect('back');
  }
  req.body.author = req.user._id;
  req.body.store = store._id;
  const review = new Review(req.body);
  await review.save();
  req.flash('success', 'Review Saved!');
  res.redirect('back');
});
