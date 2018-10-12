const multer = require('multer');
const uuidv1 = require('uuid/v1');
const jimp = require('jimp');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, done) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      done(null, true);
    } else {
      req.fileError = "That filetype isn't allowed!";
      done(null, false);
    }
  }
};

exports.upload = field => multer(multerOptions).single(field);

exports.resize = (field, width, hieght, folder) => async (req, res, next) => {
  if (req.fileError) {
    req.flash('error', req.fileError);
    return res.redirect(req.path);
  }
  if (!req.file) {
    return next();
  }
  const extention = req.file.mimetype.split('/')[1];
  req.body[field] = `${uuidv1()}.${extention}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(width, hieght);
  await photo.write(`./public/images/${folder}/${req.body[field]}`);
  next();
};
