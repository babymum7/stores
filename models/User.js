const mongoose = require('mongoose');
const passportLocalMongose = require('passport-local-mongoose');
const validator = require('validator');
const md5 = require('md5');

const { Schema } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 100,
    validate: [validator.isEmail, 'Invalid Email Address']
  },
  google: {
    id: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    email: String,
    name: {
      type: String,
      trim: true
    },
    photo: String,
    url: String
  },
  facebook: {
    id: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    email: String,
    name: {
      type: String,
      trim: true
    },
    photo: String,
    url: String
  },
  name: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar: String,
  picture: String,
  hearts: [{ type: Schema.Types.ObjectId, ref: 'Store' }],
  rates: [
    {
      store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  ],
  subscribed: { type: Boolean, index: true }
});

userSchema.index({ 'rates.store': 1 }, { sparse: true });

userSchema.plugin(passportLocalMongose, {
  usernameField: 'email',
  hashField: 'password'
});

userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200&d=retro`;
});

module.exports = mongoose.model('User', userSchema);
