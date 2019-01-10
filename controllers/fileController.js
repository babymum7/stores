const multer = require('multer');
const uuidv1 = require('uuid/v1');
const jimp = require('jimp');
const { catchErrors } = require('../handlers/errorHandlers');

const multerOptions = {
  storage: multer.memoryStorage()
};

const isFileValid = (req, res, next) => {
  if (!req.file) return next();
  if (req.file.mimetype.startsWith('image/')) return next();
  req.flash('error', "That filetype isn't allowed!");
  res.redirect('back');
};

exports.uploadStoreImage = [multer(multerOptions).single('photo'), isFileValid];

exports.resizeStoreImage = catchErrors(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const extention = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuidv1()}.${extention}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/images/uploads/${req.body.photo}`);
  next();
});
