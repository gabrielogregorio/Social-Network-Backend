let mongoose = require('mongoose');

let saveSchema = new mongoose.Schema({
  text: {
    type: String,
 },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

let Save = mongoose.model('Save', saveSchema);
module.exports = Save;
