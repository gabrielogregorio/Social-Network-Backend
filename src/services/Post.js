const Post = require('../models/Post')
const dataUser = require('../factories/dataUsers');
const UserService = require('./User');
const dataPosts = require('../factories/dataPosts')

class PostService {
  async Create({body, user, test, img, sharePost}){
    let newPostData;
    if (sharePost == undefined) {
      newPostData = {body, user, test, img}
    } else {
      newPostData = {user, sharePost}
    }
    let newPost = await new Post(newPostData);
    return await newPost.save();  
  }


  async FindById(id) {
    return await Post.findById({_id:id})
  }

  async FindPostsByIds(user, ids) {
    var posts = await Post.find({ '_id':{$in:ids} }).sort({'_id': 'desc'}).populate('user comments likes');
    var postFactories = []
    posts.forEach(async post => {
      postFactories.push(dataPosts.Build(post, user, ids))
    })
    return postFactories;
  }

  async FindPostsByUser(user) {
    return await Post.find({user}).sort({'_id': 'desc'}).populate('user comments likes');
  }

  async findFollowingPosts(id, includedUser=false) {
    let userItem = await UserService.FindById(id)
  
    let ids = dataUser.Build(userItem).followingIds;
    if (includedUser) {ids.push(id)}
    return await Post.find({ 'user':{$in:ids} }).sort({'_id': 'desc'}).populate('user comments likes');
  }

  async DeleteById(id) {
    return await Post.deleteOne({_id:id})
  }

  async FindByIdAndPopulate(_id) {
    return await Post.find({_id}).populate('user comments likes sharePost')
  }

  async FindOne(_id, user) {
    let post = await Post.findOne({_id, user}).populate('user');
    if (post == undefined) {
      return post
    }

    return dataPosts.Build(post, user)
  }

  async FindOneAndUpdate(_id, user, upload) {
    return await Post.findOneAndUpdate({_id, user}, {$set:upload})
  }

}

module.exports = new PostService()