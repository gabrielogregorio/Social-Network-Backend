let mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({

  // Texto do comentário
  text: { type: String },

  // está respondendo outro comentário
  replie: this,

  // Respostas que o comentário recebeu
  replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],

  // Resposta está na camada 1 dos posts
  base: {type: Boolean, default: false},

  // post a qual ele pertence
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },

  // usuário que comentou
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// Exibe de forma recursiva as respostas
var autoPopulateChildren = function(next) {
  this.populate('replies');
  next();
};

commentSchema
  .pre('findOne', autoPopulateChildren)
  .pre('find', autoPopulateChildren)

let Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
