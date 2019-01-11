const multer = require('multer');
const uuidv1 = require('uuid/v1');
const jimp = require('jimp');
const { catchErrors } = require('../handlers/errorHandlers');

const options = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, done) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      done(null, true);
    } else {
      done(null, false);
    }
  }
};

const singleUpload = (field, folder, width = 800, height = jimp.AUTO) => [
  multer(options).single(field),
  catchErrors(async (req, res, next) => {
    const { file } = req;
    if (!file) {
      return next();
    }
    req.body[field] = null;
    const extention = file.mimetype.split('/')[1];
    const filename = `${uuidv1()}.${extention}`;
    const photo = await jimp.read(file.buffer);
    await photo.resize(width, height);
    await photo.write(`./public/images/uploads/${folder}/${filename}`);
    req.body[field] = filename;
    next();
  })
];

exports.uploadPhoto = singleUpload('photo', 'stores', 800);
exports.uploadAvatar = singleUpload('avatar', 'avatars', 200, 200);
