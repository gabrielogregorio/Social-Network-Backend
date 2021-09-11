let mongoose = require('mongoose');

let itemSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  typeItem: {
    type: String
  }, 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

let ItemBio = mongoose.model('ItemBio', itemSchema);
module.exports = ItemBio;
