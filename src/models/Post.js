let mongoose = require('mongoose');

let postSchema = new mongoose.Schema({
  title: String, 
  body: String,
  test: Boolean,
  img: String,
  sharePost: this,
  thisReferencesShared: [this],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like'
    }
  ],
  saves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Save'
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})

let Post = mongoose.model('Post', postSchema);
module.exports = Post;
