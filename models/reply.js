const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplySchema = new Schema(
  {
    text: {type: String, trim: true, required: true},
    delete_password: {type: String, trim: true},
    reported: {type: Boolean, default: false},
  }, 
  {
    timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' },
    minimize: false
  }
);

ReplySchema.methods.getPublicFields = function () {
  const returnObject = {
    _id: this._id,
    text: this.text,
    created_on: this.created_on
  };
  return returnObject;
};

module.exports = mongoose.model('Reply', ReplySchema);