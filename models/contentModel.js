const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      unique: true,
    },
    data: {
      type: [],
      required: true,
    },
    // LATER ADD USER FOR EACH ACTIVITY
    author: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    // author: { type: mongoose.Types.ObjectId, ref: 'User'},
}
);
contentSchema.virtual('url').get(function(){
  return '/content/' + this._id
})

const Content = mongoose.model('content', contentSchema);

module.exports = Content;