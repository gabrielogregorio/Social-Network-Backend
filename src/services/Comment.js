const Comment = require('../models/Comment');
const logger = require('../logger')

class CommentService {
  async Create({post, user, text, replie, base=false}) {
    logger.info('Criação de comentário')

    let create = {post, user, text, base}
    if (replie != undefined) {create.replie = replie} 

    var newComment = new Comment(create);
    await newComment.save();  
    return newComment
  }

  async DeleteOne(_id, user) {
    return await Comment.deleteOne({_id, user});
  }

  async FindById(id) {
    return await Comment.findById({_id:id})
  }

  async FindByPosts(post) {
    return await Comment.find({post, base:true})
  }

  async FindOneAndUpdate(_id, user, update) {
    return await Comment.findOneAndUpdate({_id, user}, {$set:update})
  }
}

module.exports = new CommentService()