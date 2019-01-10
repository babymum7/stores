const { Schema, model } = require('mongoose');

const ResetSchema = new Schema({
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

ResetSchema.index({ expires: 1 }, { expires: '0' });

module.exports = model('Reset', ResetSchema);
