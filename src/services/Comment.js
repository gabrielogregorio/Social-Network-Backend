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

  async DeleteAllComments(user) {
    return await Comment.deleteMany({user});
  }

  async FindById(id) {
    return await Comment.findById({_id:id})
  }

  async FindByPosts(post) {
    let comments = await Comment.find({post, base:true})
    return comments
  }

  async FindOneAndUpdate(_id, user, update) {
    let comment = await Comment.findOneAndUpdate({_id, user}, {$set:update})
    return comment
  }
}

module.exports = new CommentService()