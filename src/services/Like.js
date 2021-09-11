const Like = require('../models/Like');

class LikeService {
  async Create(post, user) {
    var newLike = new Like({post, user});
    await newLike.save();  
    return newLike;
  }

  async DeleteLike(post, user) {
    return await Like.deleteOne({post, user});
  }

  async FindLike(post, user) {
    return await Like.findOne({post, user});
  }
}

module.exports = new LikeService()