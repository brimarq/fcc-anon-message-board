const mongoose = require('mongoose');
const Reply = require('./reply');
const Schema = mongoose.Schema;

const ThreadSchema = new Schema(
  {
    board: {type: String, trim: true, required: true},
    text: {type: String, trim: true, required: true}, 
    replies: [Reply.schema], 
    delete_password: {type: String, trim: true}, 
    reported: {type: Boolean, default: false} 
  }, 
  {
    timestamps: { createdAt: 'created_on', updatedAt: 'bumped_on' }, 
    minimize: false 
  }
);

ThreadSchema.methods.getPublicFields = function () {
  const returnObject = {
    _id: this._id,
    text: this.text,
    replies: this.replies.map(reply => reply.getPublicFields()),
    created_on: this.created_on,
    bumped_on: this.bumped_on
  };
  return returnObject;
};


module.exports = mongoose.model('Thread', ThreadSchema);