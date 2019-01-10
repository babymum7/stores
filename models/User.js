const { Schema, model } = require('mongoose');
const passportLocalMongose = require('passport-local-mongoose');
const validator = require('validator');
const md5 = require('md5');

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  facebook: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  google: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  twitter: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 100,
    validate: [validator.isEmail, 'Invalid Email Address']
  },
  name: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: String,
  subscribed: { type: Boolean, index: true }
});

UserSchema.pre('save', function() {
  if (this.avatar) {
    return;
  }
  this.avatar = `https://gravatar.com/avatar/${md5(this.email)}?s=200&d=retro`;
});

UserSchema.virtual('hearts', {
  ref: 'Heart',
  localField: '_id',
  foreignField: 'user',
  count: true
});

UserSchema.plugin(passportLocalMongose, {
  usernameField: 'username',
  hashField: 'password'
});

module.exports = model('User', UserSchema);
