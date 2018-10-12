const mongoose = require('mongoose');

const { Schema } = mongoose;

const resetSchema = new Schema({
  token: {
    type: String,
    index: true
  },
  expires: {
    type: Date,
    default: Date.now() + 1000 * 60 * 5
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

resetSchema.index({ expires: 1 }, { expires: '0' });

module.exports = mongoose.model('Reset', resetSchema);
